'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { FISHES, NPC_LIST, SHOP_BUILDINGS, SHOP_DECORATIONS } from '@/lib/utils';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function TownPlaza({ onGoFish }) {
  const npcs = useGameStore((s) => s.npcs);
  const openNpcGift = useGameStore((s) => s.openNpcGift);
  const spinWheel = useGameStore((s) => s.spinWheel);
  const lastWheelSpin = useGameStore((s) => s.lastWheelSpin);
  const buildings = useGameStore((s) => s.buildings);
  const decorations = useGameStore((s) => s.decorations);
  const activeEvent = useGameStore((s) => s.activeEvent);

  const spunToday = lastWheelSpin === new Date().toDateString();

  const handleSpinWheel = () => {
    const result = spinWheel();
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  const ownedBuildings = SHOP_BUILDINGS.filter((b) => buildings?.[b.id]);
  const ownedDecor = SHOP_DECORATIONS.filter((d) => (decorations || []).includes(d.id));

  return (
    <div
      className="p-4 sm:p-5 field-frame relative min-h-[420px] overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          'linear-gradient(160deg, rgba(40,70,50,0.55), rgba(20,40,35,0.75)), radial-gradient(ellipse at 30% 20%, #6fbf55 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #3d7a8c 0%, transparent 45%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/40 pointer-events-none rounded-[22px]" />

      <div className="relative z-10 space-y-4">
        {activeEvent && (
          <div className="rounded-xl border border-[#ffe08a]/40 bg-black/35 px-3 py-2 text-sm font-bold text-[#fff1b8]">
            {activeEvent.name} — {activeEvent.desc}
          </div>
        )}

        {/* Roda + pintu danau */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleSpinWheel}
            disabled={spunToday}
            className={`glass-card p-4 rounded-2xl text-left border-2 transition-transform ${
              spunToday
                ? 'border-white/10 opacity-70 cursor-default'
                : 'border-[#f0b429]/50 hover:scale-[1.02] hover:border-[#ffe08a]'
            }`}
          >
            <div className="text-4xl mb-2">{spunToday ? '✅' : '🎡'}</div>
            <div className="font-display font-bold text-[#f7f4e8] text-lg">Roda Harian</div>
            <p className="text-xs text-[#d7e4c8]/90 mt-1">
              {spunToday ? 'Sudah diputar hari ini — kembali besok!' : '1× putaran gratis · hadiah koin'}
            </p>
          </button>

          <button
            type="button"
            onClick={onGoFish}
            className="glass-card p-4 rounded-2xl text-left border-2 border-cyan-300/40 hover:scale-[1.02] hover:border-cyan-200 transition-transform"
          >
            <div className="text-4xl mb-2">🎣</div>
            <div className="font-display font-bold text-[#f7f4e8] text-lg">Ke Danau</div>
            <p className="text-xs text-[#d7e4c8]/90 mt-1">Lempar kail, tangkap ikan, jual di pasar</p>
          </button>
        </div>

        {/* Warga kota — interaksi utama */}
        <div>
          <h4 className="font-display font-bold text-[#f7f4e8] mb-2 flex items-center gap-2">
            <span>👥</span> Warga Kota
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {NPC_LIST.map((npc) => {
              const data = npcs[npc.id] || { level: 1, points: 0 };
              const maxPoints = data.level * 100;
              return (
                <motion.button
                  key={npc.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openNpcGift(npc.id)}
                  className="glass-card border border-pink-200/25 p-3 rounded-xl text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl bg-white/15 w-12 h-12 rounded-full flex items-center justify-center">
                      {npc.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{npc.name}</div>
                      <div className="text-[10px] text-pink-200 truncate">{npc.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-pink-100 mb-1">
                    <span>Lv {data.level}</span>
                    <span>🎁 Beri hadiah</span>
                  </div>
                  <div className="w-full h-1.5 bg-pink-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500"
                      style={{ width: `${Math.min(100, (data.points / maxPoints) * 100)}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Visual upgrade yang dimiliki */}
        <div className="glass-card rounded-xl p-3 border border-white/10">
          <h4 className="font-bold text-sm text-[#f7f4e8] mb-2">🏡 Kota Kamu</h4>
          {ownedBuildings.length === 0 && ownedDecor.length === 0 ? (
            <p className="text-xs text-[#d7e4c8]/70 italic">
              Belum ada bangunan/dekorasi. Beli di panel kiri untuk menghias kota.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...ownedBuildings, ...ownedDecor].map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 bg-black/30 border border-white/15 rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#f7f4e8]"
                >
                  <span className="text-xl">{item.emoji}</span> {item.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] text-center text-[#d7e4c8]/70 font-medium">
          Tip: kasih hadiah yang disukai warga → naik level → bonus XP
        </div>
      </div>
    </div>
  );
}

export function FishingLake({
  fishState,
  indicatorPos,
  score,
  isHolding,
  setIsHolding,
  startFishing,
  startMinigame,
  activeBait,
  selectedBaitLabel,
}) {
  return (
    <div
      className="p-4 field-frame relative min-h-[420px] overflow-hidden flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/img/backgrounds/lake_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/35 pointer-events-none rounded-[22px]" />

      {(activeBait || selectedBaitLabel) && fishState === 'idle' && (
        <div className="absolute top-3 left-3 z-20 text-[11px] font-bold bg-black/45 text-[#fff1b8] px-2.5 py-1 rounded-lg border border-[#e8d296]/30">
          Umpan: {selectedBaitLabel || `${activeBait.emoji} ${activeBait.name}`}
        </div>
      )}

      {fishState === 'idle' && (
        <button
          type="button"
          onClick={startFishing}
          className="relative z-10 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-lg hover:scale-105 transition-transform text-center"
        >
          <span className="text-5xl drop-shadow-md inline-block mb-2">🎣</span>
          <p className="text-blue-100 font-bold text-lg">Lempar Kail!</p>
          <p className="text-blue-100/70 text-xs mt-1">Pilih umpan di kiri dulu (opsional)</p>
        </button>
      )}

      {fishState === 'waiting' && (
        <div className="relative z-10 text-center">
          <span className="text-5xl drop-shadow-md animate-bounce inline-block">🎣</span>
          <p className="text-blue-100 font-bold mt-3 text-lg bg-black/30 px-4 py-1 rounded-full">
            Menunggu gigitan{activeBait ? ` · ${activeBait.emoji}` : ''}...
          </p>
        </div>
      )}

      {fishState === 'bite' && (
        <button
          type="button"
          onClick={startMinigame}
          className="relative z-10 btn-danger px-8 py-4 rounded-full border-4 border-[#ffb3aa] shadow-xl hover:scale-110 animate-pulse text-center"
        >
          <span className="text-5xl drop-shadow-md inline-block mb-2">💦</span>
          <p className="font-black text-2xl">TARIK SEKARANG!</p>
        </button>
      )}

      {fishState === 'minigame' && (
        <div className="relative z-10 w-full max-w-sm glass-card p-5 rounded-2xl shadow-2xl flex flex-col items-center">
          <h3 className="font-bold mb-3 text-[#f7f4e8] text-center leading-tight">
            Tahan tombol saat garis merah
            <br />
            di area HIJAU!
          </h3>

          <div className="w-full h-10 bg-black/40 rounded-full relative overflow-hidden mb-5 border-2 border-white/20 shadow-inner">
            <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-[#6fbf55] opacity-60 border-l-2 border-r-2 border-[#9fd67f]" />
            <div
              className="absolute w-2 h-full bg-[#ff7a6b] top-0 shadow-md transition-all duration-75 z-10 border-x border-[#ffb3aa]"
              style={{ left: `calc(${indicatorPos}%)` }}
            />
          </div>

          <div className="w-full h-4 bg-black/40 rounded-full mb-5 overflow-hidden shadow-inner border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#ffe08a] to-[#f0b429] transition-all duration-100"
              style={{ width: `${(score / GAME_CONSTANTS.FISHING.WIN_THRESHOLD) * 100}%` }}
            />
          </div>

          <button
            type="button"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
            className={`w-full py-4 text-lg btn-primary active:scale-95 touch-none select-none ${
              isHolding ? 'brightness-90 scale-[0.98]' : ''
            }`}
          >
            {isHolding ? 'MENARIK... 🎣' : 'TAHAN (KLIK) 👇'}
          </button>
        </div>
      )}
    </div>
  );
}

export function FishCatchBoard() {
  const inventory = useGameStore((s) => s.inventory);
  const sellItem = useGameStore((s) => s.sellItem);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const bahari = activeEvent?.id === 'bahari';

  const handleSell = (fish) => {
    const count = inventory[fish.id] || 0;
    if (count <= 0) return;
    const result = sellItem(fish.id, count);
    if (result) {
      toast.success(`Menjual ${count} ${fish.name}! +${result}💰`);
    } else {
      toast.error('Gagal menjual.');
    }
  };

  const owned = FISHES.filter((f) => (inventory[f.id] || 0) > 0);

  return (
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b-2 border-[#e8d296]/30 pb-2 text-[#fff1b8]">
        <span className="text-xl">🐟</span> Pasar Ikan
      </div>

      {bahari && (
        <p className="text-[10px] font-bold text-[#9fd67f] mb-2 bg-black/20 rounded-lg px-2 py-1">
          🎣 Hari Bahari — harga jual ikan ×2!
        </p>
      )}

      {owned.length === 0 ? (
        <div className="text-sm text-[#e8d296]/80 italic text-center py-4 font-bold">
          Belum ada tangkapan. Mancing di danau dulu!
        </div>
      ) : (
        <div className="space-y-1.5">
          {owned.map((fish) => {
            const count = inventory[fish.id] || 0;
            const unit = bahari ? fish.priceNormal * 2 : fish.priceNormal;
            return (
              <div
                key={fish.id}
                className="market-row market-row--up px-2.5 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-[#f7f4e8] truncate">
                    {fish.emoji} {fish.name} ×{count}
                  </div>
                  <div className="text-[10px] text-[#d7e4c8]">{unit}💰 / ekor</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSell(fish)}
                  className="text-[10px] font-black uppercase tracking-wide bg-[#f0b429] text-[#4a3208] hover:brightness-110 px-2.5 py-1.5 rounded-lg border border-[#fff1b8] whitespace-nowrap"
                >
                  Jual semua
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
