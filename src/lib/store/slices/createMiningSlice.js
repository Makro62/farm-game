import { getMiningRegenMs, rollMineralType, isWorkerActive } from '../utils';
import toast from 'react-hot-toast';
import { SHOP_MINING } from '@/lib/data/shop';

export const createMiningSlice = (set, get) => ({
  setSelectedMiningTool: (toolId) => set({ selectedMiningTool: toolId }),

  mineNode: (nodeId) => {
    const state = get();
    const node = state.mining.nodes.find(n => n.id === nodeId);
    if (!node || node.status !== 'ready') return null;

    if (!get().consumeEnergy(2)) {
      return null;
    }

    const regenTime = getMiningRegenMs(state.mining);
    
    // ===== Drop cacing saat menambang Batu (Tambang → Memancing) =====
    const dropsWorm = node.type === 'batu' && Math.random() < 0.2;

    set((state) => ({
      mining: {
        ...state.mining,
        nodes: state.mining.nodes.map(n => 
          n.id === nodeId ? { ...n, status: 'cooldown', regenAt: Date.now() + regenTime } : n
        )
      },
      inventory: {
        ...state.inventory,
        [node.type]: (state.inventory[node.type] || 0) + 1,
        ...(dropsWorm ? { cacing: (state.inventory.cacing || 0) + 1 } : {}),
      }
    }));

    get().addXP(15);
    get().progressQuest('mine', node.type, 1);
    if (dropsWorm) {
      toast('🪱 Dapat Cacing Tanah! Bisa jadi umpan pancing.', { duration: 2500 });
    }
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) {
      get().addCoins?.(Math.floor(5 * combo.multiplier));
    }
    return node.type;
  },

  useMiningTool: (itemId, nodeId = null) => {
    const state = get();
    const count = state.inventory[itemId] || 0;
    if (count <= 0) {
      return { ok: false, message: 'Kamu tidak punya alat ini. Beli di shop kanan.' };
    }

    const mining = state.mining;
    const lanternActive = mining.lanternUntil && mining.lanternUntil > Date.now();

    // ===== Cek mineralReq sebelum pakai pickaxe/upgrade (Tambang → syarat material) =====
    const checkMineralReq = (shopItemId) => {
      const shopItem = SHOP_MINING.find(m => m.id === shopItemId);
      if (!shopItem?.mineralReq) return null;
      const inv = get().inventory;
      for (const [mineral, qty] of Object.entries(shopItem.mineralReq)) {
        if ((inv[mineral] || 0) < qty) {
          return `Butuh ${qty}x ${mineral} untuk memakai ini!`;
        }
      }
      return null;
    };

    const consumeMineralReq = (shopItemId) => {
      const shopItem = SHOP_MINING.find(m => m.id === shopItemId);
      if (!shopItem?.mineralReq) return;
      set(s => {
        const newInv = { ...s.inventory };
        for (const [mineral, qty] of Object.entries(shopItem.mineralReq)) {
          newInv[mineral] = (newInv[mineral] || 0) - qty;
          if (newInv[mineral] <= 0) delete newInv[mineral];
        }
        return { inventory: newInv };
      });
    };

    if (itemId === 'pickaxe_besi') {
      if (mining.pickaxeLevel >= 2) {
        return { ok: false, message: 'Pickaxe ini sudah terpasang atau ada yang lebih baik.' };
      }
      const reqError = checkMineralReq('pickaxe_besi');
      if (reqError) return { ok: false, message: reqError };
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      consumeMineralReq('pickaxe_besi');
      set({ mining: { ...get().mining, pickaxeLevel: 2 }, selectedMiningTool: null });
      return { ok: true, message: '⛏️ Pickaxe Besi terpasang! Regen tambang 90 detik.' };
    }

    if (itemId === 'pickaxe_emas') {
      if (mining.pickaxeLevel >= 3) {
        return { ok: false, message: 'Pickaxe Emas sudah terpasang.' };
      }
      const reqError = checkMineralReq('pickaxe_emas');
      if (reqError) return { ok: false, message: reqError };
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      consumeMineralReq('pickaxe_emas');
      set({ mining: { ...get().mining, pickaxeLevel: 3 }, selectedMiningTool: null });
      return { ok: true, message: '🛠️ Pickaxe Emas terpasang! Regen 60 detik + bonus mineral langka.' };
    }

    if (itemId === 'senter') {
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      set({
        mining: { ...get().mining, lanternUntil: Date.now() + 300000 },
        selectedMiningTool: null
      });
      return { ok: true, message: '🔦 Senter aktif 5 menit! Regen 2× lebih cepat + bonus ore.' };
    }

    if (itemId === 'bom_besar') {
      const readyNodes = mining.nodes.filter(n => n.status === 'ready');
      if (readyNodes.length === 0) {
        return { ok: false, message: 'Tidak ada petak siap ditambang.' };
      }
      const reqError = checkMineralReq('bom_besar');
      if (reqError) return { ok: false, message: reqError };
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      consumeMineralReq('bom_besar');
      const regenTime = getMiningRegenMs(get().mining);
      const newInventory = { ...get().inventory };
      let mined = 0;
      const newNodes = get().mining.nodes.map(n => {
        if (n.status !== 'ready') return n;
        newInventory[n.type] = (newInventory[n.type] || 0) + 1;
        mined++;
        get().progressQuest('mine', n.type, 1);
        return { ...n, status: 'cooldown', regenAt: Date.now() + regenTime };
      });
      set({
        mining: { ...get().mining, nodes: newNodes },
        inventory: newInventory,
        selectedMiningTool: null
      });
      get().addXP(mined * 15);
      return { ok: true, message: `💣 Bom Besar meledak! ${mined} petak ditambang sekaligus.` };
    }

    if (nodeId === null || nodeId === undefined) {
      return { ok: false, needTarget: true, message: 'Pilih petak tambang dulu.' };
    }

    const node = mining.nodes.find(n => n.id === nodeId);
    if (!node) return { ok: false, message: 'Petak tidak ditemukan.' };

    if (itemId === 'bom_kecil') {
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      const regenTime = getMiningRegenMs(get().mining);
      const newInventory = { ...get().inventory };

      if (node.status === 'ready') {
        newInventory[node.type] = (newInventory[node.type] || 0) + 2;
        get().progressQuest('mine', node.type, 1);
        set({
          mining: {
            ...get().mining,
            nodes: get().mining.nodes.map(n =>
              n.id === nodeId ? { ...n, status: 'cooldown', regenAt: Date.now() + regenTime } : n
            )
          },
          inventory: newInventory,
          selectedMiningTool: null
        });
        get().addXP(20);
        return { ok: true, message: '🧨 Bom Kecil! Hasil tambang ×2 dari petak ini.' };
      }

      // Ledakkan batuan yang masih cooldown → langsung siap
      const eventId = get().activeEvent?.id || null;
      const newType = rollMineralType(mining.pickaxeLevel, lanternActive, eventId);
      set({
        mining: {
          ...get().mining,
          nodes: get().mining.nodes.map(n =>
            n.id === nodeId ? { ...n, status: 'ready', regenAt: null, type: newType } : n
          )
        },
        selectedMiningTool: null
      });
      return { ok: true, message: '🧨 Bom Kecil membuka petak yang tertutup!' };
    }

    if (itemId === 'tali') {
      if (node.status === 'ready') {
        return { ok: false, message: 'Petak ini sudah siap — tidak perlu tali.' };
      }
      if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
      const eventId = get().activeEvent?.id || null;
      const newType = rollMineralType(mining.pickaxeLevel, lanternActive, eventId);
      set({
        mining: {
          ...get().mining,
          nodes: get().mining.nodes.map(n =>
            n.id === nodeId ? { ...n, status: 'ready', regenAt: null, type: newType } : n
          )
        },
        selectedMiningTool: null
      });
      return { ok: true, message: '🪢 Tali mempercepat pemulihan petak tambang!' };
    }

    return { ok: false, message: 'Alat tidak dikenali.' };
  },

  syncMiningNodes: () => {
    const now = Date.now();
    const state = get();
    if (!state.mining) return;
    let changed = false;
    
    let newNodes = state.mining.nodes.map(n => {
      if ((n.status === 'cooldown' || n.status === 'depleted') && n.regenAt && now >= n.regenAt) {
        changed = true;
        const lanternActive = state.mining.lanternUntil && state.mining.lanternUntil > Date.now();
        const eventId = state.activeEvent?.id || null;
        return { 
          ...n, 
          status: 'ready', 
          regenAt: null,
          type: rollMineralType(state.mining.pickaxeLevel, lanternActive, eventId)
        };
      }
      return n;
    });

    if (isWorkerActive(state, 'miner')) {
      const readyNodes = newNodes.filter(n => n.status === 'ready');
      if (readyNodes.length > 0 && Math.random() < 0.2) {
        const nodeToMine = readyNodes[0];
        const minedType = nodeToMine.type;
        const lanternActive = state.mining.lanternUntil && state.mining.lanternUntil > Date.now();
        const regenTime = getMiningRegenMs(state.mining);
        const eventId = state.activeEvent?.id || null;

        newNodes = newNodes.map(n =>
          n.id === nodeToMine.id
            ? {
                ...n,
                status: 'cooldown',
                regenAt: now + regenTime,
                type: rollMineralType(state.mining.pickaxeLevel, lanternActive, eventId),
              }
            : n
        );
        changed = true;

        set({
          mining: { ...state.mining, nodes: newNodes },
          inventory: {
            ...state.inventory,
            [minedType]: (state.inventory[minedType] || 0) + 1,
          },
        });
        get().addXP(15);
        get().progressQuest('mine', minedType, 1);
        return;
      }
    }

    if (changed) {
      set({ mining: { ...state.mining, nodes: newNodes } });
    }
  },
});
