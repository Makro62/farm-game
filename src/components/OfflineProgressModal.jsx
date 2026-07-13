'use client';

import { useGameStore } from '@/lib/store';
import { getCropEmoji } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineProgressModal() {
  const offlineReport = useGameStore(state => state.offlineReport);
  const clearOfflineReport = useGameStore(state => state.clearOfflineReport);

  if (!offlineReport) return null;

  const { deltaSeconds, harvestedCrops, collectedProducts, caughtFishes, minedGems, maturedCrops, maturedNodes, earnedCoins } = offlineReport;

  // Format time (e.g. 1h 30m)
  const hours = Math.floor(deltaSeconds / 3600);
  const minutes = Math.floor((deltaSeconds % 3600) / 60);
  let timeAway = '';
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
          className="relative bg-gradient-to-b from-blue-900 to-indigo-900 w-full max-w-sm rounded-3xl p-1 shadow-2xl border-2 border-blue-400 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center">
            
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-blue-300">
              👋
            </div>
            
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 text-center mb-1">
              Selamat Datang Kembali!
            </h2>
            <p className="text-blue-200/80 text-sm mb-6 text-center">
              Pekerja Anda telah bekerja keras selama Anda pergi ({timeAway}).
            </p>

            <div className="w-full space-y-3 mb-6">
              
              {harvestedCrops > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👨‍🌾</span>
                    <span className="font-bold text-white text-sm">Hasil Panen</span>
                  </div>
                  <span className="font-bold text-green-300">+{harvestedCrops} item</span>
                </div>
              )}
              
              {collectedProducts > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👩‍🌾</span>
                    <span className="font-bold text-white text-sm">Hasil Ternak</span>
                  </div>
                  <span className="font-bold text-orange-300">+{collectedProducts} item</span>
                </div>
              )}

              {caughtFishes > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎣</span>
                    <span className="font-bold text-white text-sm">Tangkapan Ikan</span>
                  </div>
                  <span className="font-bold text-cyan-300">+{caughtFishes} ekor</span>
                </div>
              )}

              {minedGems > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⛏️</span>
                    <span className="font-bold text-white text-sm">Hasil Tambang</span>
                  </div>
                  <span className="font-bold text-purple-300">+{minedGems} batu</span>
                </div>
              )}

              {maturedCrops > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <span className="font-bold text-white text-sm">Tanaman Matang</span>
                  </div>
                  <span className="font-bold text-green-300">+{maturedCrops} petak</span>
                </div>
              )}

              {maturedNodes > 0 && (
                <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪨</span>
                    <span className="font-bold text-white text-sm">Tambang Siap</span>
                  </div>
                  <span className="font-bold text-purple-300">+{maturedNodes} petak</span>
                </div>
              )}
            </div>

            <button 
              onClick={clearOfflineReport}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 border-b-4 border-blue-700 active:border-b-0 active:mt-1"
            >
              Luar Biasa!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
