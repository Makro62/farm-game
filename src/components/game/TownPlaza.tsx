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
    <div className="p-4 sm:p-5 relative min-h-[420px] overflow-hidden rounded-xl border-2 border-green-200 bg-gradient-to-b from-sky-100 via-green-50 to-emerald-100">
      {/* Floating clouds */}
      <motion.div
        className="absolute top-4 text-4xl opacity-30 pointer-events-none"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-12 right-8 text-2xl opacity-20 pointer-events-none"
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-2 left-1/3 text-lg opacity-15 pointer-events-none"
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>

      {/* Floating birds */}
      <motion.div
        className="absolute top-8 right-1/4 text-sm opacity-25 pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🐦
      </motion.div>
      <motion.div
        className="absolute top-16 left-1/4 text-xs opacity-20 pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🐦
      </motion.div>

      <div className="relative z-10 space-y-4">
        {/* Spin Wheel */}
        <motion.button
          type="button"
          onClick={handleSpinWheel}
          disabled={spunToday}
          whileTap={!spunToday ? { scale: 0.98 } : undefined}
          className={`w-full rounded-xl text-left border-2 transition-all overflow-hidden relative ${
            spunToday
              ? "bg-gray-50 opacity-70 cursor-default border-gray-200"
              : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 hover:border-amber-400 hover:shadow-md cursor-pointer"
          }`}
        >
          <div className="p-4 flex items-center gap-3">
            <motion.div
              className="text-4xl"
              animate={!spunToday ? { rotate: [0, 10, -10, 0] } : undefined}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {spunToday ? "✅" : "🎡"}
            </motion.div>
            <div>
              <div className="font-display font-bold text-amber-900 text-lg">
                Roda Harian
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                {spunToday
                  ? "Sudah diputar hari ini — kembali besok!"
                  : "1× putaran gratis · hadiah koin"}
              </p>
            </div>
          </div>
        </motion.button>

        {/* NPCs */}
        <div>
          <h4 className="font-display font-bold text-green-900 mb-2 flex items-center gap-2">
            <span>👥</span> Warga Kota
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {NPC_LIST.map((npc, i) => {
              const data = npcs[npc.id] || { level: 1, points: 0 };
              const maxPoints = data.level * 100;
              return (
                <motion.button
                  key={npc.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openNpcGift(npc.id)}
                  className="bg-white rounded-xl text-left hover:shadow-md transition-all border-2 border-green-100 hover:border-green-300"
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.span
                        className="text-3xl bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center border-2 border-green-200"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      >
                        {npc.emoji}
                      </motion.span>
                      <div className="min-w-0">
                        <div className="font-bold text-green-900 text-sm truncate">
                          {npc.name}
                        </div>
                        <div className="text-[10px] text-green-600 truncate">
                          {npc.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-green-600 mb-1 font-bold">
                      <span>Lv {data.level}</span>
                      <span className="text-amber-600">🎁 Hadiah</span>
                    </div>
                    <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (data.points / maxPoints) * 100)}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* City buildings */}
        <div className="bg-white rounded-xl p-3 border-2 border-green-100">
          <h4 className="font-bold text-sm text-green-900 mb-2 flex items-center gap-2">
            🏘️ Kota Kamu
          </h4>
          {ownedBuildings.length === 0 && ownedDecor.length === 0 ? (
            <p className="text-xs text-green-600 italic text-center py-3">
              Belum ada bangunan. Beli di toko samping untuk menghias kota!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...ownedBuildings, ...ownedDecor].map((item, i) => (
                <motion.span
                  key={item.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 text-sm font-bold text-green-800"
                >
                  <motion.span
                    className="text-xl"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {item.emoji}
                  </motion.span>
                  {item.name}
                </motion.span>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] text-center text-green-600 font-medium">
          💡 Kasih hadiah warga → naik level → bonus XP · Mancing lewat Danau
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
      className="p-4 relative min-h-[420px] overflow-hidden flex items-center justify-center bg-cover bg-center rounded-xl border-2 border-blue-200"
      style={{ backgroundImage: "url('/img/backgrounds/lake_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 via-transparent to-blue-300/40 pointer-events-none rounded-xl" />

      {/* Animated water ripples */}
      <motion.div
        className="absolute bottom-8 left-1/4 w-20 h-3 bg-blue-400/20 rounded-full pointer-events-none"
        animate={{ scaleX: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-12 right-1/3 w-16 h-2 bg-blue-400/15 rounded-full pointer-events-none"
        animate={{ scaleX: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />

      {(activeBait || selectedBaitLabel) && fishState === "idle" && (
        <div className="absolute top-3 left-3 z-20 text-[11px] font-bold bg-white/90 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm">
          Umpan: {selectedBaitLabel || `${activeBait.emoji} ${activeBait.name}`}
        </div>
      )}

      {fishState === "idle" && (
        <motion.button
          type="button"
          onClick={startFishing}
          whileTap={{ scale: 0.95 }}
          className="relative z-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all text-center"
        >
          <motion.span
            className="text-5xl drop-shadow-md inline-block mb-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎣
          </motion.span>
          <p className="text-blue-900 font-bold text-lg">
            Lempar Kail!
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Pilih umpan di kiri dulu (opsional)
          </p>
        </motion.button>
      )}

      {fishState === "waiting" && (
        <div className="relative z-10 text-center">
          <motion.span
            className="text-5xl drop-shadow-md inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎣
          </motion.span>
          <p className="text-white font-bold mt-3 text-lg bg-blue-900/60 px-4 py-1 rounded-lg">
            Menunggu gigitan{activeBait ? ` · ${activeBait.emoji}` : ""}...
          </p>
        </div>
      )}

      {fishState === "bite" && (
        <motion.button
          type="button"
          onClick={startMinigame}
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="relative z-10 bg-red-500 text-white px-8 py-4 rounded-xl border-2 border-red-600 shadow-lg text-center"
        >
          <span className="text-5xl drop-shadow-md inline-block mb-2">💦</span>
          <p className="font-black text-2xl">TARIK SEKARANG!</p>
        </motion.button>
      )}

      {fishState === "minigame" && (
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-xl border-2 border-blue-200 flex flex-col items-center">
          <h3 className="font-bold mb-3 text-blue-900 text-center leading-tight">
            Tahan tombol saat garis merah
            <br />
            di area HIJAU!
          </h3>

          <div className="w-full h-10 bg-blue-100 rounded-full relative overflow-hidden mb-5 border-2 border-blue-200">
            <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-green-400 opacity-60 border-l-2 border-r-2 border-green-500" />
            <div
              className="absolute w-2 h-full bg-red-500 top-0 shadow-md transition-all duration-75 z-10"
              style={{ left: `calc(${indicatorPos}%)` }}
            />
          </div>

          <div className="w-full h-4 bg-blue-100 rounded-full mb-5 overflow-hidden border border-blue-200">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
              animate={{ width: `${(score / GAME_CONSTANTS.FISHING.WIN_THRESHOLD) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <button
            type="button"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
            className={`w-full py-4 text-lg font-bold rounded-xl transition-all touch-none select-none ${
              isHolding
                ? "bg-blue-700 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
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
    <div className="bg-white rounded-xl p-3 border-2 border-blue-200 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b border-blue-100 pb-2 text-blue-900">
        <span className="text-xl">🐟</span> Pasar Ikan
      </div>

      {bahari && (
        <p className="text-[10px] font-bold text-blue-700 mb-2 bg-blue-50 rounded-lg px-2 py-1">
          Hari Bahari — harga jual ikan ×2!
        </p>
      )}

      {owned.length === 0 ? (
        <div className="text-sm text-blue-400 italic text-center py-4 font-bold">
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
                className="px-2.5 py-2 flex items-center justify-between gap-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-blue-900 truncate">
                    {fish.emoji} {fish.name} ×{count}
                  </div>
                  <div className="text-[10px] text-blue-600">
                    {unit}💰 / ekor
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSell(fish)}
                  className="bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-amber-500 transition-colors whitespace-nowrap"
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
