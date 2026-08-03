import type { StoreSet, StoreGet } from "@/types/game";
import { getMiningRegenMs, rollMineralType, isWorkerActive } from "@/lib/store/utils";
import { SHOP_MINING } from "@/lib/data/shop";
import { GAME_CONSTANTS } from "@/lib/constants";

export const createMiningSlice = (set: StoreSet, get: StoreGet) => ({
  setSelectedMiningTool: (toolId) => set({ selectedMiningTool: toolId }),

  mineNode: (nodeId) => {
    const state = get();
    const node = state.mining.nodes.find((n) => n.id === nodeId);
    if (!node || node.status !== "ready") return null;
    if (!get().consumeEnergy(2)) return null;

    const regenTime = getMiningRegenMs(state.mining, state.weatherEffects);
    const dropsWorm =
      node.type === "batu" && Math.random() < GAME_CONSTANTS.CHANCES.WORM_DROP;

    set((state) => {
      const mineralCat = { ...(state.inventoryByCategory?.minerals || {}) };
      const existing = mineralCat[node.type] || {
        qty: 0,
        quality: "normal",
        acquiredAt: Date.now(),
      };
      mineralCat[node.type] = { ...existing, qty: existing.qty + 1 };

      const updates = {
        inventoryByCategory: {
          ...state.inventoryByCategory,
          minerals: mineralCat,
        },
      };

      if (dropsWorm) {
        const colCat = { ...(state.inventoryByCategory?.collectibles || {}) };
        const w = colCat.cacing || {
          qty: 0,
          quality: "normal",
          acquiredAt: Date.now(),
        };
        colCat.cacing = { ...w, qty: w.qty + 1 };
        updates.inventoryByCategory = {
          ...updates.inventoryByCategory,
          collectibles: colCat,
        };
      }

      return {
        mining: {
          ...state.mining,
          nodes: state.mining.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, status: "cooldown", regenAt: Date.now() + regenTime }
              : n,
          ),
        },
        ...updates,
      };
    });

    get().addXP(GAME_CONSTANTS.XP.MINE);
    get().progressQuest("mine", node.type, 1);
    set((s) => ({
      stats: {
        ...s.stats,
        totalMined: (s.stats?.totalMined || 0) + 1,
        ...(node.type === "berlian"
          ? { totalDiamondsMined: (s.stats?.totalDiamondsMined || 0) + 1 }
          : {}),
        ...(dropsWorm
          ? { totalWormsFound: (s.stats?.totalWormsFound || 0) + 1 }
          : {}),
      },
    }));
    get().markSessionAction?.("mined");
    get().checkAchievements?.();
    if (dropsWorm)
      get().enqueueNotification(
        "🪱 Dapat Cacing Tanah! Bisa jadi umpan pancing.",
        { duration: 2500 },
      );
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) get().addCoins?.(Math.floor(5 * combo.multiplier));
    return node.type;
  },

  useMiningTool: (itemId, nodeId = null) => {
    const state = get();
    const count = state.inventoryByCategory?.tools?.[itemId]?.qty || 0;
    if (count <= 0)
      return {
        ok: false,
        message: "Kamu tidak punya alat ini. Beli di shop kanan.",
      };

    const mining = state.mining;
    const lanternActive =
      mining.lanternUntil && mining.lanternUntil > Date.now();

    const checkMineralReq = (shopItemId) => {
      const shopItem = SHOP_MINING.find((m) => m.id === shopItemId);
      if (!shopItem?.mineralReq) return null;
      for (const [mineral, qty] of Object.entries(shopItem.mineralReq)) {
        if ((state.inventoryByCategory?.minerals?.[mineral]?.qty || 0) < (qty as number)) {
          return `Butuh ${qty}x ${mineral} untuk memakai ini!`;
        }
      }
      return null;
    };

    const consumeMineralReq = (shopItemId) => {
      const shopItem = SHOP_MINING.find((m) => m.id === shopItemId);
      if (!shopItem?.mineralReq) return;
      set((draft) => {
        for (const [mineral, qty] of Object.entries(shopItem.mineralReq)) {
          if (draft.inventoryByCategory.minerals[mineral]) {
            draft.inventoryByCategory.minerals[mineral].qty -= qty as number;
            if (draft.inventoryByCategory.minerals[mineral].qty <= 0) {
              delete draft.inventoryByCategory.minerals[mineral];
            }
          }
        }
      });
    };

    const removeTool = () => {
      set((draft) => {
        if (draft.inventoryByCategory.tools[itemId]) {
          draft.inventoryByCategory.tools[itemId].qty -= 1;
          if (draft.inventoryByCategory.tools[itemId].qty <= 0) {
            delete draft.inventoryByCategory.tools[itemId];
          }
        }
      });
    };

    if (itemId === "pickaxe_besi") {
      if (mining.pickaxeLevel >= 2)
        return {
          ok: false,
          message: "Pickaxe ini sudah terpasang atau ada yang lebih baik.",
        };
      const reqError = checkMineralReq("pickaxe_besi");
      if (reqError) return { ok: false, message: reqError };
      removeTool();
      consumeMineralReq("pickaxe_besi");
      set({
        mining: { ...get().mining, pickaxeLevel: 2 },
        selectedMiningTool: null,
      });
      return {
        ok: true,
        message: "⛏️ Pickaxe Besi terpasang! Regen tambang 90 detik.",
      };
    }

    if (itemId === "pickaxe_emas") {
      if (mining.pickaxeLevel >= 3)
        return { ok: false, message: "Pickaxe Emas sudah terpasang." };
      const reqError = checkMineralReq("pickaxe_emas");
      if (reqError) return { ok: false, message: reqError };
      removeTool();
      consumeMineralReq("pickaxe_emas");
      set({
        mining: { ...get().mining, pickaxeLevel: 3 },
        selectedMiningTool: null,
      });
      return {
        ok: true,
        message:
          "🛠️ Pickaxe Emas terpasang! Regen 60 detik + bonus mineral langka.",
      };
    }

    if (itemId === "senter") {
      removeTool();
      set({
        mining: {
          ...get().mining,
          lanternUntil: Date.now() + GAME_CONSTANTS.MINING.LANTERN_DURATION_MS,
        },
        selectedMiningTool: null,
      });
      return {
        ok: true,
        message: "🔦 Senter aktif 5 menit! Regen 2× lebih cepat + bonus ore.",
      };
    }

    if (itemId === "bom_besar") {
      const readyNodes = mining.nodes.filter((n) => n.status === "ready");
      if (readyNodes.length === 0)
        return { ok: false, message: "Tidak ada petak siap ditambang." };
      const reqError = checkMineralReq("bom_besar");
      if (reqError) return { ok: false, message: reqError };
      removeTool();
      consumeMineralReq("bom_besar");
      const regenTime = getMiningRegenMs(get().mining, get().weatherEffects);
      let mined = 0;
      const mineralGains: Record<string, number> = {};
      const newNodes = get().mining.nodes.map((n) => {
        if (n.status !== "ready") return n;
        mined++;
        mineralGains[n.type] = (mineralGains[n.type] || 0) + 1;
        get().progressQuest("mine", n.type, 1);
        return { ...n, status: "cooldown", regenAt: Date.now() + regenTime };
      });
      set((draft) => {
        const mineralCat = { ...(draft.inventoryByCategory?.minerals || {}) };
        for (const [type, qty] of Object.entries(mineralGains)) {
          const existing = mineralCat[type] || {
            qty: 0,
            quality: "normal",
            acquiredAt: Date.now(),
          };
          mineralCat[type] = { ...existing, qty: existing.qty + qty };
        }
        draft.mining.nodes = newNodes;
        draft.inventoryByCategory = {
          ...draft.inventoryByCategory,
          minerals: mineralCat,
        };
        draft.selectedMiningTool = null;
      });
      get().addXP(mined * 15);
      set((s) => ({
        stats: { ...s.stats, totalMined: (s.stats?.totalMined || 0) + mined },
      }));
      get().checkAchievements?.();
      return {
        ok: true,
        message: `💣 Bom Besar meledak! ${mined} petak ditambang sekaligus.`,
      };
    }

    if (nodeId === null || nodeId === undefined) {
      return {
        ok: false,
        needTarget: true,
        message: "Pilih petak tambang dulu.",
      };
    }

    const node = mining.nodes.find((n) => n.id === nodeId);
    if (!node) return { ok: false, message: "Petak tidak ditemukan." };

    if (itemId === "bom_kecil") {
      removeTool();
      const regenTime = getMiningRegenMs(get().mining, get().weatherEffects);
      if (node.status === "ready") {
        get().progressQuest("mine", node.type, 1);
        set((state) => {
          const mineralCat = { ...(state.inventoryByCategory?.minerals || {}) };
          const existing = mineralCat[node.type] || {
            qty: 0,
            quality: "normal",
            acquiredAt: Date.now(),
          };
          mineralCat[node.type] = { ...existing, qty: existing.qty + 2 };
          return {
            inventoryByCategory: {
              ...state.inventoryByCategory,
              minerals: mineralCat,
            },
            mining: {
              ...state.mining,
              nodes: state.mining.nodes.map((n) =>
                n.id === nodeId
                  ? { ...n, status: "cooldown", regenAt: Date.now() + regenTime }
                  : n,
              ),
            },
            selectedMiningTool: null,
          };
        });
        get().addXP(20);
        set((s) => ({
          stats: { ...s.stats, totalMined: (s.stats?.totalMined || 0) + 1 },
        }));
        get().checkAchievements?.();
        return {
          ok: true,
          message: "🧨 Bom Kecil! Hasil tambang ×2 dari petak ini.",
        };
      }
      const eventId = get().activeEvent?.id || null;
      const newType = rollMineralType(
        mining.pickaxeLevel,
        lanternActive,
        eventId,
      );
      set({
        mining: {
          ...get().mining,
          nodes: get().mining.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, status: "ready", regenAt: null, type: newType }
              : n,
          ),
        },
        selectedMiningTool: null,
      });
      return { ok: true, message: "🧨 Bom Kecil membuka petak yang tertutup!" };
    }

    if (itemId === "tali") {
      if (node.status === "ready")
        return {
          ok: false,
          message: "Petak ini sudah siap — tidak perlu tali.",
        };
      removeTool();
      const eventId = get().activeEvent?.id || null;
      const newType = rollMineralType(
        mining.pickaxeLevel,
        lanternActive,
        eventId,
      );
      set({
        mining: {
          ...get().mining,
          nodes: get().mining.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, status: "ready", regenAt: null, type: newType }
              : n,
          ),
        },
        selectedMiningTool: null,
      });
      return {
        ok: true,
        message: "🪢 Tali mempercepat pemulihan petak tambang!",
      };
    }

    return { ok: false, message: "Alat tidak dikenali." };
  },

  syncMiningNodes: () => {
    const now = Date.now();
    const state = get();
    if (!state.mining) return;
    let changed = false;
    let newNodes = state.mining.nodes.map((n) => {
      if (
        (n.status === "cooldown" || n.status === "depleted") &&
        n.regenAt &&
        now >= n.regenAt
      ) {
        changed = true;
        const lanternActive =
          state.mining.lanternUntil && state.mining.lanternUntil > Date.now();
        const eventId = state.activeEvent?.id || null;
        return {
          ...n,
          status: "ready",
          regenAt: null,
          type: rollMineralType(
            state.mining.pickaxeLevel,
            lanternActive,
            eventId,
          ),
        };
      }
      return n;
    });

    if (isWorkerActive(state, "miner")) {
      const readyNodes = newNodes.filter((n) => n.status === "ready");
      if (
        readyNodes.length > 0 &&
        Math.random() < GAME_CONSTANTS.CHANCES.MINER_AUTO_TICK
      ) {
        const nodeToMine = readyNodes[0];
        const minedType = nodeToMine.type;
        const regenTime = getMiningRegenMs(state.mining, state.weatherEffects);
        newNodes = newNodes.map((n) =>
          n.id === nodeToMine.id
            ? { ...n, status: "cooldown", regenAt: now + regenTime }
            : n,
        );
        changed = true;

        set((draft) => {
          draft.mining.nodes = newNodes;
          if (!draft.inventoryByCategory.minerals[minedType]) {
            draft.inventoryByCategory.minerals[minedType] = {
              qty: 0,
              quality: "normal",
              acquiredAt: Date.now(),
            };
          }
          draft.inventoryByCategory.minerals[minedType].qty += 1;
        });
        get().addXP(GAME_CONSTANTS.XP.MINE);
        get().progressQuest("mine", minedType, 1);
        return;
      }
    }

    if (changed) set({ mining: { ...state.mining, nodes: newNodes } });
  },
});
