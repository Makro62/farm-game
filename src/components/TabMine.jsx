'use client';

import { useGameStore } from '@/lib/store';
import { MINERALS, getCropEmoji } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
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
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
              <span>⛏️</span> Alat Tambang
            </div>
            
            <button className="w-full bg-gray-100 border-2 border-gray-300 p-3 rounded-xl mb-4 text-left flex justify-between items-center cursor-default">
              <div>
                <div className="font-bold">🪨 Cangkul Kayu</div>
                <div className="text-xs text-gray-500">Lv 1 (Default)</div>
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold">Dipakai</span>
            </button>

            <button className="w-full bg-white hover:bg-orange-50 border-2 border-orange-200 p-3 rounded-xl mb-2 text-left flex justify-between items-center transition-colors">
              <div>
                <div className="font-bold text-orange-700">🔶 Cangkul Tembaga</div>
                <div className="text-xs text-orange-500 text-[10px]">Butuh: 5x Tembaga</div>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Upgrade</span>
            </button>
            
            {/* Pekerja Auto */}
            <div className="font-bold text-lg mb-3 mt-6 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireMiner}
              className={`w-full border-2 p-2 rounded-xl shadow-sm flex justify-between items-center transition-colors text-left mb-6 ${
                workers.miner
                  ? 'bg-gray-100 border-gray-400'
                  : 'bg-white border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="font-bold text-gray-800 text-sm">⛏️ Kurcaci Tambang</div>
                <div className="text-[10px] text-gray-500">Auto-Mine</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers.miner ? '✅ Dimiliki' : '15000💰'}
              </span>
            </button>
            
            {/* Pabrik / Produksi */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-red-200 pb-2 text-red-900 mt-6">
              <span>🏭</span> Pabrik (Crafting)
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-6">
              <span className="text-red-300 text-sm font-medium italic">Fitur ini akan segera hadir.</span>
            </div>

            <InventoryWidget />
          </div>
        </div>

        {/* ================= RIGHT COLUMN (GRID) ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 sm:p-6 bg-[#3b3a36]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
              <h2 className="text-2xl font-bold text-gray-200">Gua Tambang</h2>
              <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Klik batu untuk menambang!</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-4 relative z-10 bg-[#252422] p-4 rounded-xl border-4 border-[#1a1918]">
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
    </div>
  );
}
