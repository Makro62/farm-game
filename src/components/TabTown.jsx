import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { FISHES, NPC_LIST } from '@/lib/utils';
import { InventoryWidget } from './InventoryWidget';
import toast from 'react-hot-toast';

export default function TabTown() {
  const spinWheel = useGameStore(state => state.spinWheel);
  const spendCoins = useGameStore(state => state.spendCoins);
  const addCoins = useGameStore(state => state.addCoins);
  const addItem = useGameStore(state => state.addItem);
  const activateCoinBooster = useGameStore(state => state.activateCoinBooster);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);
  const buyGrowthBooster = useGameStore(state => state.buyGrowthBooster);
  const growthMultiplier = useGameStore(state => state.growthMultiplier);
  const dev = useGameStore(state => state.dev);
  const openConfirm = useGameStore(state => state.openConfirm);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const inventory = useGameStore(state => state.inventory);
  const activeEvent = useGameStore(state => state.activeEvent);
  const npcs = useGameStore(state => state.npcs);
  const openNpcGift = useGameStore(state => state.openNpcGift);

  const [fishState, setFishState] = useState('idle'); // idle | waiting | bite | minigame
  const [indicatorPos, setIndicatorPos] = useState(50);
  const [score, setScore] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const holdingRef = useRef(false);

  // Update ref when state changes so setInterval sees it
  useEffect(() => {
    holdingRef.current = isHolding;
  }, [isHolding]);

  // Handle waiting for bite
  useEffect(() => {
    if (fishState === 'waiting') {
      const waitTime = 2000 + Math.random() * 3000;
      const timer = setTimeout(() => {
        setFishState('bite');
      }, waitTime);
      return () => clearTimeout(timer);
    }
  }, [fishState]);

  // Handle bite window
  useEffect(() => {
    if (fishState === 'bite') {
      const timer = setTimeout(() => {
        toast.error('Yah, ikannya lepas! 🐟💨');
        setFishState('idle');
      }, 1500); // 1.5s to react
      return () => clearTimeout(timer);
    }
  }, [fishState]);

  // Handle minigame loop
  useEffect(() => {
    if (fishState !== 'minigame') return;
    
    let pos = 50;
    let dir = 1;
    let currentScore = 0;
    const speed = 2 + Math.random() * 3;
    
    const interval = setInterval(() => {
      pos += dir * speed;
      if (pos >= 90) { pos = 90; dir = -1; }
      if (pos <= 10) { pos = 10; dir = 1; }
      
      setIndicatorPos(pos);
      
      // Hit zone is between 35 and 65
      const inZone = pos >= 35 && pos <= 65;
      if (inZone && holdingRef.current) {
        currentScore += 1;
        setScore(currentScore);
      } else if (!inZone && holdingRef.current) {
        currentScore -= 0.5; // Penalty for holding outside zone
        if (currentScore < 0) currentScore = 0;
        setScore(currentScore);
      }

      if (currentScore >= 50) {
        finishMinigame(true);
      }
    }, 50);

    const timeout = setTimeout(() => {
      finishMinigame(false);
    }, 5000); // 5 seconds max

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fishState]);

  const finishMinigame = (success) => {
    setFishState('idle');
    setIsHolding(false);
    setScore(0);
    
    if (success) {
      // Roll fish based on chance
      const rand = Math.random();
      let cumulative = 0;
      let caughtFish = FISHES[0];
      for (const fish of FISHES) {
        cumulative += fish.chance;
        if (rand <= cumulative) {
          caughtFish = fish;
          break;
        }
      }
      
      addItem(caughtFish.id, 1);
      toast.success(`Berhasil menangkap ${caughtFish.emoji} ${caughtFish.name}!`, { duration: 4000 });
    } else {
      toast.error('Gagal menangkap ikan, kurang tarikan!');
    }
  };

  const startFishing = () => {
    setFishState('waiting');
  };

  const startMinigame = () => {
    setFishState('minigame');
    setScore(0);
    setIndicatorPos(50);
  };


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

  const handleBuyGrowthBooster = () => {
    if (growthMultiplier > 1) {
      toast('Booster Growth sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Growth',
      'Beli Booster Growth x1.5 (Tumbuh lebih cepat) seharga 50 💰?',
      () => {
        if (buyGrowthBooster()) {
          toast.success('Booster Growth x1.5 Aktif!', { icon: '🌱' });
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
      {activeEvent && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 mb-6 shadow-lg text-white flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="text-5xl bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
            {activeEvent.name.split(' ')[0]}
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-pink-200 uppercase mb-1">Event Spesial Hari Ini</div>
            <h2 className="font-black text-2xl">{activeEvent.name.split(' ').slice(1).join(' ')}</h2>
            <p className="opacity-90 font-medium text-sm mt-1">{activeEvent.desc}</p>
          </div>
        </div>
      )}

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
            <button onClick={handleBuyGrowthBooster} className={`w-full p-2 rounded-xl shadow-sm mb-2 font-bold flex justify-between items-center transition-transform ${growthMultiplier > 1 ? 'bg-green-500 text-white cursor-default' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-105'}`}>
              <span>🌱 Growth ×1.5</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{growthMultiplier > 1 ? 'AKTIF' : '50💰'}</span>
            </button>
            <button onClick={handleBuyBooster} className={`w-full p-2 rounded-xl shadow-sm mb-6 font-bold flex justify-between items-center transition-transform ${coinMultiplier > 1 ? 'bg-amber-600 text-white cursor-default' : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:scale-105'}`}>
              <span>💰 Coin ×2</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{coinMultiplier > 1 ? 'AKTIF' : '100💰'}</span>
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

            {/* Danau Pemancingan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-blue-200 pb-2 text-blue-900">
              <span>🎣</span> Danau Pemancingan (Interaktif)
            </div>
            <div className="bg-[#4a90e2] p-4 rounded-3xl shadow-inner border-8 border-[#357abd] relative min-h-[250px] overflow-hidden flex items-center justify-center mb-8">
              
              {fishState === 'idle' && (
                <button onClick={startFishing} className="relative z-10 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-lg hover:scale-105 transition-transform text-center">
                  <span className="text-5xl drop-shadow-md inline-block mb-2">🎣</span>
                  <p className="text-blue-100 font-bold text-lg">Lempar Kail!</p>
                </button>
              )}

              {fishState === 'waiting' && (
                <div className="relative z-10 text-center">
                  <span className="text-5xl drop-shadow-md animate-bounce inline-block">🎣</span>
                  <p className="text-blue-100 font-bold mt-3 text-lg bg-black/30 px-4 py-1 rounded-full">Menunggu gigitan...</p>
                </div>
              )}

              {fishState === 'bite' && (
                <button onClick={startMinigame} className="relative z-10 bg-red-500 text-white px-8 py-4 rounded-full border-4 border-white shadow-xl hover:scale-110 animate-pulse text-center">
                  <span className="text-5xl drop-shadow-md inline-block mb-2">💦</span>
                  <p className="font-black text-2xl">TARIK SEKARANG!</p>
                </button>
              )}

              {fishState === 'minigame' && (
                <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl flex flex-col items-center border border-gray-200">
                  <h3 className="font-bold mb-3 text-gray-800 text-center leading-tight">Tahan tombol saat garis merah<br/>di area HIJAU!</h3>
                  
                  <div className="w-full h-10 bg-gray-200 rounded-full relative overflow-hidden mb-5 border-[3px] border-gray-400 shadow-inner">
                    {/* Green zone (35% to 65%) */}
                    <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-green-400 opacity-60 border-l-2 border-r-2 border-green-500" />
                    {/* Indicator */}
                    <div className="absolute w-2 h-full bg-red-600 top-0 shadow-md transition-all duration-75 z-10" style={{ left: `calc(${indicatorPos}%)` }} />
                  </div>
                  
                  <div className="w-full h-4 bg-gray-200 rounded-full mb-5 overflow-hidden shadow-inner border border-gray-300">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-100" style={{ width: `${(score / 50) * 100}%` }} />
                  </div>
                  
                  <button 
                    onPointerDown={() => setIsHolding(true)}
                    onPointerUp={() => setIsHolding(false)}
                    onPointerLeave={() => setIsHolding(false)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 touch-none select-none ${isHolding ? 'bg-blue-600 shadow-inner' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    {isHolding ? 'MENARIK... 🎣' : 'TAHAN (KLIK) 👇'}
                  </button>
                </div>
              )}
            </div>

            {/* Pasar Ikan Kota */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-teal-200 pb-2 text-teal-900 mt-8">
              <span>🏪</span> Hasil Tangkapan (Inventory Ikan)
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 items-center justify-center">
              {FISHES.every(f => !inventory[f.id]) && (
                <span className="text-teal-400 text-sm font-medium italic">Belum ada ikan yang ditangkap.</span>
              )}
              {FISHES.map(f => inventory[f.id] > 0 && (
                <div key={f.id} className="bg-white p-2 rounded-lg border border-teal-200 shadow-sm flex flex-col items-center">
                  <span className="text-3xl mb-1">{f.emoji}</span>
                  <span className="font-bold text-xs">{f.name}</span>
                  <span className="text-[10px] bg-teal-100 px-2 py-0.5 rounded text-teal-800 font-bold mt-1">x{inventory[f.id]}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 h-full">
            
            <InventoryWidget />

            {/* Warga Kota (NPCs) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-pink-200 pb-2 text-pink-900 mt-6">
              <span>👨‍👩‍👧‍👦</span> Warga Kota
            </div>
            <div className="space-y-3 mb-8">
              {NPC_LIST.map(npc => {
                const data = npcs[npc.id] || { level: 1, points: 0 };
                const maxPoints = data.level * 100;
                return (
                  <div key={npc.id} className="bg-pink-50 border border-pink-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="text-3xl bg-white p-2 rounded-full shadow-sm">{npc.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-pink-900 text-sm flex justify-between">
                        <span>{npc.name}</span>
                        <span className="text-pink-600 bg-pink-100 px-2 rounded-full text-xs">Lv {data.level}</span>
                      </div>
                      <div className="text-[10px] text-pink-700 mb-1">{npc.role}</div>
                      <div className="w-full h-1.5 bg-pink-200 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${(data.points / maxPoints) * 100}%` }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => openNpcGift(npc.id)}
                      className="bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-100 p-2 rounded-xl transition-colors shadow-sm active:scale-95"
                      title="Beri Hadiah"
                    >
                      🎁
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Dapur Ikan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2 text-orange-900 mt-6">
              <span>🍳</span> Dapur Ikan
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-4">
              <span className="text-orange-300 text-sm font-medium italic">Fitur ini akan segera hadir.</span>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
