'use client';

import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NPC_LIST, getCropEmoji } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Modals() {
  const { modals, closeModals, inventory, giveGift } = useGameStore();
  const [promptValue, setPromptValue] = useState(1);
  const [selectedGift, setSelectedGift] = useState(null);

  // Reset prompt value when modal opens
  useEffect(() => {
    if (modals.prompt.isOpen) {
      setPromptValue(1);
    }
    if (modals.npcGift.isOpen) {
      setSelectedGift(null);
    }
  }, [modals.prompt.isOpen, modals.npcGift.isOpen]);

  const handlePromptSubmit = () => {
    const val = parseInt(promptValue);
    if (!isNaN(val) && val > 0) {
      if (modals.prompt.onConfirm) {
        modals.prompt.onConfirm(val);
      }
      closeModals();
    }
  };

  const handleConfirmSubmit = () => {
    if (modals.confirm.onConfirm) {
      modals.confirm.onConfirm();
    }
    closeModals();
  };

  const handleGiveGift = () => {
    if (!selectedGift) return;
    const npcId = modals.npcGift.npcId;
    const npcData = NPC_LIST.find(n => n.id === npcId);
    
    // Check if liked
    const isLiked = npcData.likes.includes(selectedGift) || npcData.likes.some(like => selectedGift.includes(like));
    
    const result = giveGift(npcId, selectedGift, isLiked);
    
    if (result) {
      if (isLiked) {
        toast.success(`${npcData.name}: "Wah, terima kasih banyak! Saya sangat suka ini!" 🥰`, { duration: 4000 });
      } else {
        toast(`${npcData.name}: "Hmm... terima kasih atas hadiahnya." 🙂`, { icon: '🎁', duration: 3000 });
      }
      
      if (result.leveledUp) {
        toast.success(`🎉 Level Persahabatan dengan ${npcData.name} naik ke Level ${result.newLevel}!`);
      }
    } else {
      toast.error('Gagal memberikan hadiah.');
    }
    
    closeModals();
  };

  const targetNpc = modals.npcGift.npcId ? NPC_LIST.find(n => n.id === modals.npcGift.npcId) : null;


  return (
    <>
      <div className="rain-overlay"></div>
      
      <AnimatePresence>
        {modals.confirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">{modals.confirm.title}</h2>
              <p className="text-gray-600 mb-6">{modals.confirm.msg}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={closeModals}
                  className="px-4 py-2 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 shadow-md transition-colors"
                >
                  Ya
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {modals.prompt.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border-4 border-green-200"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🛒</div>
                <h2 className="text-xl font-bold text-gray-800">{modals.prompt.title}</h2>
                <p className="text-gray-500 text-sm">{modals.prompt.msg}</p>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <button 
                  onClick={() => setPromptValue(Math.max(1, promptValue - 1))}
                  className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center hover:bg-red-200 active:scale-95 transition-all"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={promptValue}
                  onChange={(e) => setPromptValue(parseInt(e.target.value) || 1)}
                  className="w-20 text-center text-2xl font-bold border-2 border-green-200 rounded-xl py-2 focus:outline-none focus:border-green-500"
                  min="1"
                />
                <button 
                  onClick={() => setPromptValue(promptValue + 1)}
                  className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center hover:bg-blue-200 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={closeModals}
                  className="py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handlePromptSubmit}
                  className="py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700 active:scale-95 transition-all"
                >
                  Beli
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {modals.npcGift.isOpen && targetNpc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border-4 border-pink-200"
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2 drop-shadow-md">{targetNpc.emoji}</div>
                <h2 className="text-2xl font-black text-gray-800">{targetNpc.name}</h2>
                <p className="text-pink-500 font-bold text-sm bg-pink-50 inline-block px-3 py-1 rounded-full">{targetNpc.role}</p>
                <p className="text-gray-500 text-sm mt-3">Pilih barang dari inventory Anda untuk diberikan sebagai hadiah.</p>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-6 max-h-[150px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                {Object.keys(inventory).length === 0 && (
                  <div className="col-span-5 text-center text-xs text-gray-400 py-4">Inventory kosong...</div>
                )}
                {Object.entries(inventory).map(([item, amount]) => amount > 0 && (
                  <button 
                    key={`gift-${item}`}
                    onClick={() => setSelectedGift(item)}
                    className={`bg-white rounded-lg p-2 flex flex-col items-center border-2 relative transition-all hover:scale-105 active:scale-95
                      ${selectedGift === item ? 'border-pink-500 bg-pink-50 shadow-md transform scale-110' : 'border-gray-200'}
                    `}
                  >
                    <span className="text-2xl">{getCropEmoji(item)}</span>
                    <span className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {amount}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={closeModals}
                  className="py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleGiveGift}
                  disabled={!selectedGift}
                  className={`py-3 rounded-xl font-bold shadow-md transition-all ${
                    selectedGift 
                      ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white hover:scale-[1.02] active:scale-95' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Beri Hadiah 🎁
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
