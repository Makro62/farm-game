'use client';

import { useGameStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function TabTown() {
  const spinWheel = useGameStore(state => state.spinWheel);
  const spendCoins = useGameStore(state => state.spendCoins);
  const activateCoinBooster = useGameStore(state => state.activateCoinBooster);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);
  const dev = useGameStore(state => state.dev);
  const openConfirm = useGameStore(state => state.openConfirm);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);

  const handleSpinWheel = () => {
    const result = spinWheel();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyBooster = () => {
    if (coinMultiplier > 1) {
      toast('Booster sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Koin',
      'Apakah Anda yakin ingin membeli Booster Koin x2 seharga 100 💰?',
      () => {
        if (spendCoins(100)) {
          activateCoinBooster();
          toast.success('Booster Koin x2 Aktif!', { icon: '💰' });
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyMerchant = () => {
    if (workers.fisher) {
      toast('Pemancing Kota sudah disewa! 🎣', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Pemancing Kota',
      'Sewa Pemancing Kota (Auto-mancing) seharga 12000 💰?',
      () => {
        if (hireWorker('fisher', 12000)) {
          toast.success('Pemancing Kota berhasil disewa! 🎣');
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
            
            {/* 1. Bibit Ikan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-cyan-200 pb-2 text-cyan-900">
              <span>🐟</span> BIBIT IKAN
            </div>
            <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100 text-sm text-cyan-800 mb-6 text-center italic">
              Buka di Level 10
            </div>

            {/* 2. Dekorasi */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2 text-green-900 mt-6">
              <span>🏡</span> DEKORASI
            </div>
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-sm text-green-800 mb-6 text-center italic">
              Shop dekorasi kosong.
            </div>

            {/* 3. Bangunan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2 text-orange-900 mt-6">
              <span>🏗️</span> Bangunan
            </div>
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-sm text-orange-800 mb-6 text-center italic">
              Area bangunan belum tersedia.
            </div>

            {/* 4. Booster */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-yellow-200 pb-2 text-yellow-900 mt-6">
              <span>⚡</span> Booster
            </div>
            <button onClick={handleBuyBooster} className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-2 rounded-xl shadow-sm mb-6 font-bold flex justify-between items-center hover:scale-105 transition-transform">
              <span>💰 Coin ×2</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">100💰</span>
            </button>

            {/* 5. Roda Harian */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2 text-purple-900 mt-6">
              <span>🎡</span> Roda Harian
            </div>
            <button onClick={handleSpinWheel} className="w-full bg-white border-2 border-amber-300 p-2 rounded-xl shadow-sm flex justify-between items-center hover:bg-amber-50 transition-colors text-left mb-6" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1))' }}>
              <div>
                <div className="font-bold text-amber-700 text-sm">🎰 Putar Roda</div>
                <div className="text-[10px] text-gray-500">1x Putaran Gratis/Hari</div>
              </div>
            </button>

            {/* 6. Pekerja Kota */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-blue-200 pb-2 text-blue-900 mt-6">
              <span>🧑‍🌾</span> Pekerja Kota (Auto)
            </div>
            <button onClick={handleBuyMerchant} className={`w-full border-2 p-2 rounded-xl shadow-sm flex justify-between items-center transition-colors text-left mb-2 ${workers.fisher ? 'bg-green-50 border-green-300' : 'bg-white border-blue-200 hover:bg-blue-50'}`}>
              <div>
                <div className="font-bold text-blue-900 text-sm">🧑‍🌾 Pemancing Kota</div>
                <div className="text-[10px] text-gray-500">Auto-mancing & jual hasil</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers.fisher ? '✅ Disewa' : '12000💰'}
              </span>
            </button>
            <button
              onClick={() => toast('Fitur memancing segera hadir! 🎣', { icon: '⏳' })}
              className={`w-full px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border mb-6 ${workers.fisher ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
            >
              🧑‍🌾 Auto: {workers.fisher ? 'SIAP' : 'OFF'}
            </button>

            {/* 7. Achievements */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-indigo-200 pb-2 text-indigo-900 mt-6">
              <span>🏆</span> Achievements
            </div>
            <div className="text-sm font-bold text-gray-500">0 / 12</div>

            {/* Cheat Panel / Dev Menu */}
            <div className="mt-8 border-t border-red-200 pt-4">
               <div className="font-bold text-xs text-red-600 mb-2">🛠️ CHEAT MENU (DEV)</div>
               <div className="flex gap-2">
                  <button onClick={() => dev.addCoins(1000)} className="flex-1 bg-gray-800 text-green-400 text-xs py-1 rounded">
                    +1000 💰
                  </button>
                  <button onClick={() => dev.setLevel(useGameStore.getState().level + 1)} className="flex-1 bg-gray-800 text-blue-400 text-xs py-1 rounded">
                    +1 LVL
                  </button>
               </div>
            </div>

          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 min-h-[500px]">
            
            {/* Area Dekorasi */}
            <div className="min-h-[100px] border-2 border-dashed border-green-200 rounded-2xl flex items-center justify-center mb-6">
               <span className="text-green-400/50 font-medium italic">Area Dekorasi Kota</span>
            </div>

            {/* Danau Pemancingan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-blue-200 pb-2 text-blue-900">
              <span>🎣</span> Danau Pemancingan (Peternakan Ikan)
            </div>
            <div className="bg-[#4a90e2] p-4 rounded-3xl shadow-inner border-8 border-[#357abd] relative min-h-[200px] overflow-hidden flex items-center justify-center mb-8">
              <div className="text-center relative z-10 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-lg">
                <span className="text-4xl drop-shadow-md inline-block mb-2">🐟</span>
                <p className="text-blue-100 text-sm">Fitur belum tersedia</p>
              </div>
            </div>

            {/* Pasar Ikan Kota */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-teal-200 pb-2 text-teal-900 mt-8">
              <span>🏪</span> Pasar Ikan Kota
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 items-center justify-center">
              <span className="text-teal-400 text-sm font-medium italic">Belum ada ikan di pasar.</span>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 h-full">
            
            {/* Dapur Ikan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2 text-orange-900 mt-6">
              <span>🍳</span> Dapur Ikan (Masakan Laut)
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 min-h-[120px] flex items-center justify-center mb-4">
              <span className="text-orange-300 text-sm font-medium italic">Antrean masak kosong.</span>
            </div>
            
            {/* Recipes Placeholder */}
            <div className="space-y-2">
              <div className="bg-white border border-gray-100 p-2 rounded-lg flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2">
                   <span className="text-xl">🍣</span>
                   <span className="text-sm font-bold">Sushi</span>
                </div>
                <span className="text-xs">1 🐟</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
