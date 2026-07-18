'use client';

import { useGameStore } from '@/lib/store';
import { formatNumber } from '@/lib/utils';
import { getItemEmoji, getItemDisplayName, getItemSellPrice } from '@/lib/data/item-helpers';
import { SHOP_SEEDS } from '@/lib/data/crops';
import { SHOP_ANIMALS, SHOP_BAIT, SHOP_MINING } from '@/lib/data/shop';
import { FISHES } from '@/lib/data/fishes';
import { MINERALS } from '@/lib/data/minerals';
import { RECIPES } from '@/lib/data/recipes';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '@/lib/data/achievements';
import { SEASON_META } from '@/lib/nav';
import TabPage from './ui/TabPage';
import Button from './ui/Button';
import { Coins, Star, Trophy, CalendarDays, Shield, Settings, X, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
// ===== Widget lintas-sistem: membaca semua slice sekaligus =====
function ActionWidget() {
  const plots = useGameStore((s) => s.plots || []);
  const animals = useGameStore((s) => s.animals || []);
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);
  const craftingQueue = useGameStore((s) => s.craftingQueue || []);
  const orders = useGameStore((s) => s.orders || []);
  const inventory = useGameStore((s) => s.inventory || {});

  const now = Date.now();
  const hints = [];

  // 1. Tanaman siap panen?
  const readyPlots = plots.filter(p =>
    p.crop && (p.status === 'ready' || (p.status === 'growing' && p.plantedAt && p.growTime && now - p.plantedAt >= p.growTime))
  );
  if (readyPlots.length > 0) {
    hints.push({ emoji: '🌾', text: `${readyPlots.length} tanaman siap dipanen di Ladang!`, color: 'bg-green-100 border-green-300 text-green-800' });
  }

  // 2. Hewan siap dipanen?
  const readyAnimals = animals.filter(a => a.status === 'producing' && now - (a.lastCollected || 0) >= (a.produceTime || 60000));
  if (readyAnimals.length > 0) {
    hints.push({ emoji: '🐄', text: `${readyAnimals.length} hewan siap diambil hasilnya di Ternak!`, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' });
  }

  // 3. Pelanggan menunggu di Restoran?
  if (activeCustomers.length > 0) {
    hints.push({ emoji: '👥', text: `${activeCustomers.length} pelanggan menunggu di Restoran!`, color: 'bg-orange-100 border-orange-300 text-orange-800' });
  }

  // 4. Masakan siap diambil dari dapur?
  const doneCooking = craftingQueue.filter(q => now - q.startTime >= q.duration);
  if (doneCooking.length > 0) {
    const recipeName = RECIPES.find(r => r.id === doneCooking[0].recipeId)?.name || 'Masakan';
    hints.push({ emoji: '🍳', text: `${recipeName} selesai dimasak — ambil di Restoran!`, color: 'bg-red-100 border-red-300 text-red-800' });
  }

  // 5. Order hampir kadaluarsa?
  const urgentOrders = (orders || []).filter(o => {
    const remainingMs = (o.timer * 1000) - (now - o.createdAt);
    return remainingMs > 0 && remainingMs < 5 * 60 * 1000;
  });
  if (urgentOrders.length > 0) {
    hints.push({ emoji: '⏰', text: `${urgentOrders.length} pesanan Order Board segera kadaluarsa!`, color: 'bg-purple-100 border-purple-300 text-purple-800' });
  }

  // 6. Pupuk kandang tersedia?
  if ((inventory.pupuk_kandang || 0) > 0) {
    hints.push({ emoji: '🌿', text: `Punya ${inventory.pupuk_kandang} Pupuk Kandang — otomatis dipakai saat tanam!`, color: 'bg-emerald-100 border-emerald-300 text-emerald-800' });
  }

  // 7. Cacing cukup untuk umpan?
  if ((inventory.cacing || 0) >= 2) {
    hints.push({ emoji: '🪱', text: `Punya ${inventory.cacing} Cacing — bisa dibuat Umpan di menu Memancing!`, color: 'bg-blue-100 border-blue-300 text-blue-800' });
  }

  if (hints.length === 0) return null;

  return (
    <div className="glass-panel p-4 mb-5">
      <h3 className="font-display font-bold text-sm text-[var(--text-primary)] flex items-center gap-2 mb-3">
        <span className="text-lg">📊</span> Apa yang bisa kukerjakan sekarang?
      </h3>
      <div className="space-y-2">
        {hints.map((hint, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border-2 ${hint.color}`}>
            <span className="text-base flex-shrink-0">{hint.emoji}</span>
            <span>{hint.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TabProfil() {
  const inventory = useGameStore((state) => state.inventory);
  const coins = useGameStore((state) => state.coins);
  const level = useGameStore((state) => state.level);
  const xp = useGameStore((state) => state.xp);
  const day = useGameStore((state) => state.season?.day || 1);
  const season = useGameStore((state) => state.season?.current || 'spring');
  const achievements = useGameStore((state) => state.achievements || {});
  const sellItem = useGameStore((state) => state.sellItem);
  const sellAllInventory = useGameStore((state) => state.sellAllInventory);
  const coinMultiplier = useGameStore((state) => state.coinMultiplier);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const resetGame = useGameStore((state) => state.resetGame);
  const dev = useGameStore((state) => state.dev);

  const [showSettings, setShowSettings] = useState(false);
  const xpNeeded = level * 100;
  const seasonMeta = SEASON_META[season] || SEASON_META.spring;

  const categorized = {
    bibit: [],
    pertanian: [],
    peternakan: [],
    tambang: [],
    pancing: [],
    dapur: [],
    lainnya: [],
  };

  Object.entries(inventory).forEach(([itemId, qty]) => {
    if (qty <= 0) return;

    if (SHOP_SEEDS.some((s) => s.id === itemId)) {
      categorized.bibit.push({ id: itemId, qty });
    } else if (SHOP_SEEDS.some((s) => s.cropId === itemId)) {
      categorized.pertanian.push({ id: itemId, qty });
    } else if (SHOP_ANIMALS.some((a) => a.product === itemId)) {
      categorized.peternakan.push({ id: itemId, qty });
    } else if (MINERALS.some((m) => m.id === itemId) || SHOP_MINING.some((m) => m.id === itemId)) {
      categorized.tambang.push({ id: itemId, qty });
    } else if (FISHES.some((f) => f.id === itemId) || SHOP_BAIT.some((b) => b.id === itemId)) {
      categorized.pancing.push({ id: itemId, qty });
    } else if (RECIPES.some((r) => r.id === itemId)) {
      categorized.dapur.push({ id: itemId, qty });
    } else {
      categorized.lainnya.push({ id: itemId, qty });
    }
  });

  const categoriesConfig = [
    { key: 'pertanian', title: 'Hasil Pertanian', icon: '🌱' },
    { key: 'peternakan', title: 'Hasil Peternakan', icon: '🐄' },
    { key: 'tambang', title: 'Bahan Tambang', icon: '⛏️' },
    { key: 'pancing', title: 'Hasil Tangkapan', icon: '🎣' },
    { key: 'dapur', title: 'Olahan Dapur', icon: '🍳' },
    { key: 'bibit', title: 'Bibit Tanaman', icon: '🌰' },
    { key: 'lainnya', title: 'Lainnya', icon: '📦' },
  ];

  const hasSellable = Object.entries(inventory).some(
    ([id, qty]) => qty > 0 && getItemSellPrice(id) > 0
  );

  const handleSellItem = (itemId, name, qty) => {
    const price = getItemSellPrice(itemId);
    if (!price) {
      toast.error('Barang ini tidak bisa dijual.');
      return;
    }
    const total = price * qty;
    openConfirm(
      'Jual Barang',
      `Jual semua ${qty}x ${name} seharga ${formatNumber(total)} 💰?`,
      () => {
        const earned = sellItem(itemId, qty);
        if (earned > 0) {
          toast.success(`Terjual seharga ${formatNumber(earned)} 💰`, { icon: '💰' });
        }
      }
    );
  };

  const handleSellAll = () => {
    openConfirm(
      'Jual Semua Hasil',
      'Jual semua hasil yang bisa dijual? Umpan & alat tidak ikut.',
      () => {
        const earned = sellAllInventory();
        if (earned > 0) {
          toast.success(
            coinMultiplier > 1
              ? `Terjual ${formatNumber(earned)} 💰 (×${coinMultiplier} booster!)`
              : `Terjual semua hasil seharga ${formatNumber(earned)} 💰!`
          );
        } else {
          toast.error('Tidak ada hasil yang bisa dijual.');
        }
      }
    );
  };

  return (
    <TabPage>
      <div className="glass-panel p-3 sm:p-5 overflow-y-auto max-h-full">
        <div className="flex items-center justify-between gap-2 mb-4 mt-1">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--primary-dark)]" />
            Profil & Gudang
          </h2>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-white/50 hover:bg-white p-2 rounded-xl border-2 border-white/60 transition-colors shadow-sm"
          >
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Widget Lintas-Sistem */}
        <ActionWidget />

        {/* SETTINGS / CHEAT MODAL */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#FFFDF7] border-4 border-[var(--wood)] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="bg-[var(--wood)] px-4 py-3 flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Pengaturan & Cheat
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {process.env.NODE_ENV === 'development' && (
                  <div>
                    <h4 className="text-xs font-black text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> Mode Developer (Cheat)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="shop" size="sm" onClick={() => { dev.addCoins(10000); toast.success('+10.000 Koin!'); }}>+10.000 Koin</Button>
                      <Button variant="shop" size="sm" onClick={() => { dev.addEnergy(100); toast.success('+100 Energy!'); }}>Max Energy</Button>
                      <Button variant="shop" size="sm" onClick={() => { dev.instantGrow(); toast.success('Semua tanaman langsung panen!'); }}>Panen Instan</Button>
                      <Button variant="shop" size="sm" onClick={() => { dev.unlockAll(); toast.success('Semua pekerja & bangunan terbuka!'); }}>Unlock Semua</Button>
                      <Button variant="shop" size="sm" onClick={() => { dev.setLevel(50); toast.success('Level Maksimal!'); }}>Max Level (50)</Button>
                    </div>
                  </div>
                )}

                <hr className="border-t-2 border-black/5" />

                <div>
                  <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2">Sistem</h4>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      openConfirm('Reset Game', 'Apakah Anda yakin ingin menghapus SEMUA data permainan? Ini tidak bisa dikembalikan!', () => {
                        resetGame();
                        toast.success('Game telah direset!');
                        setShowSettings(false);
                      });
                    }}
                  >
                    Reset Ulang Game
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/40 p-3 rounded-2xl border-2 border-white/50 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">Level Pemain</div>
            <div className="flex items-center gap-1 font-display text-2xl text-[var(--primary-dark)]">
              <Star className="w-5 h-5 fill-current text-[var(--gold)]" />
              {level}
            </div>
            <div className="text-[10px] font-black text-black/40 bg-black/5 px-2 py-0.5 rounded-full mt-1">
              XP {formatNumber(xp)} / {formatNumber(xpNeeded)}
            </div>
          </div>

          <div className="bg-white/40 p-3 rounded-2xl border-2 border-white/50 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">Total Koin</div>
            <div className="flex items-center gap-1 font-display text-2xl text-amber-600">
              <Coins className="w-5 h-5 fill-current" />
              {formatNumber(coins)}
            </div>
          </div>

          <div className="bg-white/40 p-3 rounded-2xl border-2 border-white/50 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">Musim & Hari</div>
            <div className="flex items-center gap-1 font-display text-2xl text-emerald-700">
              <CalendarDays className="w-5 h-5" />
              Hari {day}
            </div>
            <div className="text-[10px] font-black text-black/40 bg-black/5 px-2 py-0.5 rounded-full mt-1">
              {seasonMeta.emoji} {seasonMeta.label}
            </div>
          </div>

          <div className="bg-white/40 p-3 rounded-2xl border-2 border-white/50 flex flex-col items-center justify-center text-center">
            <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">Pencapaian</div>
            <div className="flex items-center gap-1 font-display text-2xl text-blue-600">
              <Trophy className="w-5 h-5 fill-current" />
              {Object.values(inventory).filter((q) => q > 0).length}
            </div>
            <div className="text-[10px] font-black text-black/40 bg-black/5 px-2 py-0.5 rounded-full mt-1">
              Jenis Item Dimiliki
            </div>
          </div>
        </div>

        {/* ================= ACHIEVEMENT SECTION ================= */}
        <div className="glass-panel p-4 sm:p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b-2 border-white/30 pb-2">
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <span>🏆</span> Pencapaian (Achievements)
            </h3>
            <div className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow-inner">
              {Object.keys(achievements).length} / {ACHIEVEMENTS.length} Terbuka
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const isUnlocked = achievements[ach.id]?.unlocked;
              const isSecret = ach.secret && !isUnlocked;
              return (
                <div key={ach.id} className={`p-3 rounded-2xl border-2 flex items-start gap-3 transition-all ${isUnlocked ? 'bg-[#fff7e6] border-[var(--gold)] shadow-sm' : 'bg-black/5 border-black/10 opacity-70 grayscale'}`}>
                  <div className="text-3xl flex-shrink-0 drop-shadow-sm">
                    {isSecret ? '❓' : ach.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] leading-tight">
                      {isSecret ? 'Pencapaian Rahasia' : ach.name}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                      {isSecret ? 'Selesaikan kondisinya untuk membuka.' : ach.desc}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[9px] font-black uppercase bg-black/10 text-black/60 px-1.5 py-0.5 rounded-full">
                        {ACHIEVEMENT_CATEGORIES[ach.category]?.label || 'Spesial'}
                      </span>
                      {ach.rewardXp > 0 && <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">+{ach.rewardXp} XP</span>}
                      {ach.rewardCoins > 0 && <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">+{ach.rewardCoins} 💰</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className="glass-panel p-4 sm:p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b-2 border-white/30 pb-2">
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <span>🎒</span> Isi Tas / Gudang
            </h3>
            {hasSellable && (
              <Button variant="danger" size="sm" onClick={handleSellAll}>
                Jual Semua Hasil
              </Button>
            )}
          </div>

          {categoriesConfig.map(({ key, title, icon }) => {
            const items = categorized[key];
            if (items.length === 0) return null;

            return (
              <div key={key} className="mb-6 last:mb-0">
                <h4 className="text-[13px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  {icon} {title}
                  <span className="text-[10px] bg-[var(--wood)] text-[#FFE08A] px-2 py-0.5 rounded-full">
                    {items.length} Jenis
                  </span>
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {items.map((item) => {
                    const name = getItemDisplayName(item.id);
                    const emoji = getItemEmoji(item.id);
                    const price = getItemSellPrice(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSellItem(item.id, name, item.qty)}
                        className="bg-[var(--card)] hover:bg-[#fff7e6] hover:-translate-y-1 transition-all cursor-pointer border-2 border-[var(--wood-light)] hover:border-[var(--gold)] rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center relative shadow-sm group"
                        title={price ? `Klik untuk jual\nHarga: ${price}💰/ea` : 'Tidak bisa dijual'}
                      >
                        <div className="text-3xl sm:text-4xl mb-1 drop-shadow-sm group-hover:scale-110 transition-transform">
                          {emoji}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-bold text-[var(--text-primary)] leading-tight max-w-full truncate w-full">
                          {name}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-b from-[var(--gold)] to-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 min-w-[20px] rounded-full shadow-md border border-white">
                          {item.qty}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {Object.values(inventory).every((q) => !q) && (
            <div className="text-center py-10 opacity-60">
              <div className="text-4xl mb-2">🕸️</div>
              <p className="font-bold text-[var(--text-secondary)]">Tas Anda masih kosong...</p>
            </div>
          )}
        </div>
      </div>
    </TabPage>
  );
}
