"use client";

import { useGameStore } from "@/lib/store";
import { getCropEmoji } from "@/lib/data/item-helpers";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";

export default function OfflineProgressModal() {
  const offlineReport = useGameStore((state) => state.offlineReport);
  const clearOfflineReport = useGameStore((state) => state.clearOfflineReport);

  if (!offlineReport) return null;

  const {
    deltaSeconds,
    harvestedCrops,
    collectedProducts,
    caughtFishes,
    minedGems,
    maturedCrops,
    maturedNodes,
    earnedCoins,
  } = offlineReport;

  // Format time (e.g. 1h 30m)
  const hours = Math.floor(deltaSeconds / 3600);
  const minutes = Math.floor((deltaSeconds % 3600) / 60);
  let timeAway = "";
  if (hours > 0) timeAway += `${hours}j `;
  if (minutes > 0) timeAway += `${minutes}m`;
  if (!timeAway) timeAway = `${deltaSeconds}s`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={clearOfflineReport}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative glass-panel w-full max-w-sm"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-b from-[#ffe08a] to-[#f0b429] rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-[0_4px_0_#b07a10] border-2 border-[#fff1b8]">
              👋
            </div>

            <h2 className="text-2xl font-display font-bold text-[#3E2723] text-center mb-1 drop-shadow-md">
              Selamat Datang Kembali!
            </h2>
            <p className="text-[#5D4037] text-sm mb-6 text-center font-medium">
              Pekerja Anda telah bekerja keras selama Anda pergi ({timeAway}).
            </p>

            <div className="w-full space-y-3 mb-6">
              {harvestedCrops > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">👨‍🌾</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Hasil Panen
                    </span>
                  </div>
                  <span className="font-black text-[#6fbf55] drop-shadow-sm">
                    +{harvestedCrops} item
                  </span>
                </div>
              )}

              {collectedProducts > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">👩‍🌾</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Hasil Ternak
                    </span>
                  </div>
                  <span className="font-black text-[#ff9a5a] drop-shadow-sm">
                    +{collectedProducts} item
                  </span>
                </div>
              )}

              {caughtFishes > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🎣</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Tangkapan Ikan
                    </span>
                  </div>
                  <span className="font-black text-cyan-400 drop-shadow-sm">
                    +{caughtFishes} ekor
                  </span>
                </div>
              )}

              {minedGems > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">⛏️</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Hasil Tambang
                    </span>
                  </div>
                  <span className="font-black text-[#d8a8ff] drop-shadow-sm">
                    +{minedGems} batu
                  </span>
                </div>
              )}

              {maturedCrops > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🌱</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Tanaman Matang
                    </span>
                  </div>
                  <span className="font-black text-[#6fbf55] drop-shadow-sm">
                    +{maturedCrops} petak
                  </span>
                </div>
              )}

              {maturedNodes > 0 && (
                <div className="flex justify-between items-center glass-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-sm">🪨</span>
                    <span className="font-bold text-[#3E2723] text-sm">
                      Tambang Siap
                    </span>
                  </div>
                  <span className="font-black text-[#d8a8ff] drop-shadow-sm">
                    +{maturedNodes} petak
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={clearOfflineReport}
            >
              Luar Biasa!
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
