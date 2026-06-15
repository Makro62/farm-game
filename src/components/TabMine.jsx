'use client';

import { useGameStore } from '@/lib/store';
import { MINERALS, getCropEmoji } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function TabMine() {
  const mining = useGameStore(state => state.mining);
  const mineNode = useGameStore(state => state.mineNode);
  const inventory = useGameStore(state => state.inventory);
  const hireWorker = useGameStore(state => state.hireWorker);
  const workers = useGameStore(state => state.workers);
  const openConfirm = useGameStore(state => state.openConfirm);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMine = (node) => {
    if (node.status !== 'ready') return;
    
    // In a real game, here we would start a progress bar (2-10s) based on pickaxe level.
    // For now, instant mine with toast.
    const minedType = mineNode(node.id);
    if (minedType) {
      const mineral = MINERALS.find(m => m.id === minedType);
      toast.success(`Berhasil menambang ${mineral.emoji} ${mineral.name}!`);
    }
  };

  const handleHireMiner = () => {
    if (workers.miner) {
      toast('Kurcaci Tambang sudah bekerja! ⛏️', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Kurcaci Tambang',
      'Sewa Kurcaci Tambang seharga 15.000 💰? Dia akan menambang otomatis untukmu!',
      () => {
        if (hireWorker('miner', 15000)) {
          toast.success('Kurcaci Tambang berhasil disewa! ⛏️');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4">
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white">
              <span>⛏️</span> Alat Tambang
            </div>
            
            <button className="w-full glass-card p-3 mb-4 text-left flex justify-between items-center cursor-default">
              <div>
                <div className="font-bold">🪨 Cangkul Kayu</div>
                <div className="text-xs text-gray-500">Lv 1 (Default)</div>
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold">Dipakai</span>
            </button>

            <button className="w-full glass-card p-3 mb-2 text-left flex justify-between items-center transition-colors">
              <div>
                <div className="font-bold text-orange-700">🔶 Cangkul Tembaga</div>
                <div className="text-xs text-orange-500 text-[10px]">Butuh: 5x Tembaga</div>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Upgrade</span>
            </button>
            
            {/* Pekerja Auto */}
            <div className="font-bold text-lg mb-3 mt-6 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireMiner}
              className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left mb-6 ${
                workers.miner
                  ? 'border-primary bg-white/10'
                  : ''
              }`}
            >
              <div>
                <div className="font-bold text-gray-100 text-sm">⛏️ Kurcaci Tambang</div>
                <div className="text-[10px] text-gray-500">Auto-Mine</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers.miner ? '✅ Dimiliki' : '15000💰'}
              </span>
            </button>
            
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4">
            
            <StatusHeader />

            <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
              <div className="font-bold text-lg flex items-center gap-2 text-white drop-shadow-md">
                <span>⛏️</span> Gua Tambang
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => toast('Auto Tambang berjalan via Kurcaci Tambang!', { icon: '⛏️' })}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${workers.miner ? 'bg-gray-700 text-white border-gray-800' : 'glass-card text-gray-200'}`}
                 >
                  ⛏️ Auto: {workers.miner ? 'ON' : 'OFF'}
                 </button>
              </div>
            </div>

            <div 
              className="p-4 sm:p-6 rounded-3xl shadow-inner border-4 border-[#252422] relative min-h-[400px] bg-cover bg-center"
              style={{ backgroundImage: "url('/img/backgrounds/mine_bg.png')" }}
            >
              <div className="absolute inset-0 bg-black/50 rounded-2xl pointer-events-none"></div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-4 relative z-10">
                {mining.nodes.map((node) => {
                  const isReady = node.status === 'ready';
                  let progress = 0;
                  if (!isReady && node.regenAt) {
                    progress = Math.max(0, Math.min(100, 100 - ((node.regenAt - currentTime) / (120 * 1000)) * 100));
                  }

                  return (
                    <motion.button
                      key={node.id}
                      whileHover={isReady ? { scale: 1.05 } : {}}
                      whileTap={isReady ? { scale: 0.95 } : {}}
                      onClick={() => handleMine(node)}
                      disabled={!isReady}
                      className={`aspect-square rounded-xl relative overflow-hidden flex flex-col items-center justify-center transition-all shadow-md border-b-4
                        ${isReady ? 'bg-[#5c5952] border-[#3d3b36] hover:bg-[#6b6861] cursor-pointer' : 'bg-[#1f1e1c] border-[#141312] cursor-not-allowed'}
                      `}
                    >
                      {isReady ? (
                        <span className="text-4xl drop-shadow-md">🪨</span>
                      ) : (
                        <div className="w-full px-2 flex flex-col items-center">
                          <span className="text-xl opacity-30 mb-1">🪨</span>
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 h-full">
            
            <InventoryWidget />

            {/* Pabrik / Produksi */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>🏭</span> Pabrik (Crafting)
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-6">
              <span className="text-red-300 text-sm font-medium italic">Fitur ini akan segera hadir.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
