"use client";

import { motion } from "framer-motion";
import { useGameStore, useInventory } from "@/lib/store";
import { FISHES } from "@/lib/data/fishes";
import { NPC_LIST } from "@/lib/data/npcs";
import { SHOP_BUILDINGS, SHOP_DECORATIONS } from "@/lib/data/shop";
import { GAME_CONSTANTS } from "@/lib/constants";
import toast from "react-hot-toast";

export function TownPlaza() {
  const npcs = useGameStore((s) => s.npcs);
  const openNpcGift = useGameStore((s) => s.openNpcGift);
  const spinWheel = useGameStore((s) => s.spinWheel);
  const lastWheelSpin = useGameStore((s) => s.lastWheelSpin);
  const buildings = useGameStore((s) => s.buildings);
  const decorations = useGameStore((s) => s.decorations);

  const spunToday =
    (lastWheelSpin as string | null) === new Date().toDateString();

  const handleSpinWheel = () => {
    const result = spinWheel();
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  const ownedBuildings = SHOP_BUILDINGS.filter((b) => buildings?.[b.id]);
  const ownedDecor = SHOP_DECORATIONS.filter((d) =>
    (decorations || []).includes(d.id),
  );

  return (
    <div
      className="p-4 sm:p-5 field-frame relative min-h-[420px] overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(165deg, rgba(184,228,255,0.55) 0%, rgba(200,232,168,0.65) 45%, rgba(143,203,122,0.7) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[var(--wood)]/20 pointer-events-none rounded-[22px]" />

      <div className="relative z-10 space-y-4">
        <button
          type="button"
          onClick={handleSpinWheel}
          disabled={spunToday}
          className={`w-full glass-card p-4 rounded-full text-left border-2 transition-transform ${
            spunToday
              ? "opacity-70 cursor-default border-[var(--wood)]/40"
              : "border-[var(--gold)] hover:scale-[1.01]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">{spunToday ? "✅" : "🎡"}</div>
            <div>
              <div className="font-display font-bold text-[var(--text-primary)] text-lg">
                Roda Harian
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {spunToday
                  ? "Sudah diputar hari ini — kembali besok!"
                  : "1× putaran gratis · hadiah koin"}
              </p>
            </div>
          </div>
        </button>

        <div>
          <h4 className="font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
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
                  className="glass-card p-3 rounded-full text-left hover:brightness-105 transition-colors border-2 border-[var(--wood)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl bg-[var(--shop-bg)] w-12 h-12 rounded-full flex items-center justify-center border-2 border-[var(--wood)]">
                      {npc.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--text-primary)] text-sm truncate">
                        {npc.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] truncate">
                        {npc.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] mb-1 font-bold">
                    <span>Lv {data.level}</span>
                    <span>Beri hadiah</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--wood)]/25 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)]"
                      style={{
                        width: `${Math.min(100, (data.points / maxPoints) * 100)}%`,
                      }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3">
          <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">
            Kota Kamu
          </h4>
          {ownedBuildings.length === 0 && ownedDecor.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] italic">
              Belum ada bangunan/dekorasi. Beli di toko samping untuk menghias
              kota.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...ownedBuildings, ...ownedDecor].map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 bg-[var(--shop-bg)] border-2 border-[var(--wood)] rounded-xl px-2.5 py-1.5 text-sm font-bold text-[var(--text-primary)]"
                >
                  <span className="text-xl">{item.emoji}</span> {item.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] text-center text-[var(--text-secondary)] font-medium">
          Tip: kasih hadiah yang disukai warga → naik level → bonus XP · Mancing
          lewat tombol Danau
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/30 pointer-events-none rounded-[22px]" />

      {(activeBait || selectedBaitLabel) && fishState === "idle" && (
        <div className="absolute top-3 left-3 z-20 text-[11px] font-bold bg-[var(--panel)] text-[var(--text-primary)] px-2.5 py-1 rounded-xl border-2 border-[var(--wood)] shadow-md">
          Umpan: {selectedBaitLabel || `${activeBait.emoji} ${activeBait.name}`}
        </div>
      )}

      {fishState === "idle" && (
        <button
          type="button"
          onClick={startFishing}
          className="relative z-10 bg-white/85 backdrop-blur-md px-6 py-4 rounded-full border-[3px] border-[var(--wood)] shadow-[0_5px_0_var(--wood-light)] hover:scale-105 transition-transform text-center"
        >
          <span className="text-5xl drop-shadow-md inline-block mb-2">🎣</span>
          <p className="text-[var(--text-primary)] font-bold text-lg">
            Lempar Kail!
          </p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">
            Pilih umpan di kiri dulu (opsional)
          </p>
        </button>
      )}

      {fishState === "waiting" && (
        <div className="relative z-10 text-center">
          <span className="text-5xl drop-shadow-md animate-bounce inline-block">
            🎣
          </span>
          <p className="text-white font-bold mt-3 text-lg bg-black/40 px-4 py-1 rounded-full">
            Menunggu gigitan{activeBait ? ` · ${activeBait.emoji}` : ""}...
          </p>
        </div>
      )}

      {fishState === "bite" && (
        <button
          type="button"
          onClick={startMinigame}
          className="relative z-10 btn-danger px-8 py-4 rounded-full border-4 border-[#ffb3aa] shadow-xl hover:scale-110 animate-pulse text-center"
        >
          <span className="text-5xl drop-shadow-md inline-block mb-2">💦</span>
          <p className="font-black text-2xl">TARIK SEKARANG!</p>
        </button>
      )}

      {fishState === "minigame" && (
        <div className="relative z-10 w-full max-w-sm glass-card p-5 rounded-2xl shadow-2xl flex flex-col items-center">
          <h3 className="font-bold mb-3 text-[var(--text-primary)] text-center leading-tight">
            Tahan tombol saat garis merah
            <br />
            di area HIJAU!
          </h3>

          <div className="w-full h-10 bg-[var(--wood)]/30 rounded-full relative overflow-hidden mb-5 border-2 border-[var(--wood)] shadow-inner">
            <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-[var(--primary)] opacity-60 border-l-2 border-r-2 border-[var(--primary-light)]" />
            <div
              className="absolute w-2 h-full bg-[#ff7a6b] top-0 shadow-md transition-all duration-75 z-10 border-x border-[#ffb3aa]"
              style={{ left: `calc(${indicatorPos}%)` }}
            />
          </div>

          <div className="w-full h-4 bg-[var(--wood)]/30 rounded-full mb-5 overflow-hidden shadow-inner border border-[var(--wood)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--primary)] transition-all duration-100"
              style={{
                width: `${(score / GAME_CONSTANTS.FISHING.WIN_THRESHOLD) * 100}%`,
              }}
            />
          </div>

          <button
            type="button"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
            className={`w-full py-4 text-lg btn-primary touch-none select-none ${
              isHolding ? "brightness-90" : ""
            }`}
          >
            {isHolding ? "MENARIK..." : "TAHAN (KLIK)"}
          </button>
        </div>
      )}
    </div>
  );
}

export function FishCatchBoard() {
  const inventory = useInventory();
  const sellItem = useGameStore((s) => s.sellItem);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const bahari = activeEvent?.id === "bahari";

  const handleSell = (fish) => {
    const count = inventory[fish.id] || 0;
    if (count <= 0) return;
    const result = sellItem(fish.id, count);
    if (result) {
      toast.success(`Menjual ${count} ${fish.name}! +${result}💰`);
    } else {
      toast.error("Gagal menjual.");
    }
  };

  const owned = FISHES.filter((f) => (inventory[f.id] || 0) > 0);

  return (
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b-2 border-[var(--wood)]/40 pb-2 text-[var(--text-primary)]">
        <span className="text-xl">🐟</span> Pasar Ikan
      </div>

      {bahari && (
        <p className="text-[10px] font-bold text-[var(--primary-dark)] mb-2 bg-[var(--primary-light)]/35 rounded-lg px-2 py-1">
          Hari Bahari — harga jual ikan ×2!
        </p>
      )}

      {owned.length === 0 ? (
        <div className="text-sm text-[var(--text-secondary)] italic text-center py-4 font-bold">
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
                  <div className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                    {fish.emoji} {fish.name} ×{count}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {unit}💰 / ekor
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSell(fish)}
                  className="btn-gold !text-[10px] !px-2.5 !py-1.5 uppercase tracking-wide whitespace-nowrap"
                >
                  Jual
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
