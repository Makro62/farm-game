"use client";

import { useGameStore, useInventory } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NPC_LIST } from "@/lib/data/npcs";
import { getCropEmoji } from "@/lib/data/item-helpers";
import Button from "@/components/ui/Button";
import QtyControl from "@/components/ui/QtyControl";
import toast from "react-hot-toast";
import OfflineProgressModal from "./OfflineProgressModal";

export default function Modals() {
  const modals = useGameStore((state) => state.modals);
  const closeModals = useGameStore((state) => state.closeModals);
  const inventory = useInventory();
  const giveGift = useGameStore((state) => state.giveGift);
  const [promptValue, setPromptValue] = useState(1);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  useEffect(() => {
    if (modals.prompt.isOpen) setPromptValue(1);
    if (modals.npcGift.isOpen) setSelectedGift(null);
  }, [modals.prompt.isOpen, modals.npcGift.isOpen]);

  const handlePromptSubmit = () => {
    const val = Number(promptValue);
    if (!isNaN(val) && val > 0) {
      (modals.prompt.onConfirm as ((v: number) => void) | null)?.(val);
      closeModals();
    }
  };

  const handleConfirmSubmit = () => {
    modals.confirm.onConfirm?.();
    closeModals();
  };

  const handleGiveGift = () => {
    if (!selectedGift) return;
    const npcId = modals.npcGift.npcId;
    const npcData = NPC_LIST.find((n) => n.id === npcId);

    const isLiked =
      npcData.likes.includes(selectedGift) ||
      npcData.likes.some((like) => selectedGift.includes(like));

    const result = giveGift(npcId, selectedGift, isLiked);

    if (result) {
      if (isLiked) {
        toast.success(
          `${npcData.name}: "Wah, terima kasih banyak! Saya sangat suka ini!" 🥰`,
          {
            duration: 4000,
          },
        );
      } else {
        toast(`${npcData.name}: "Hmm... terima kasih atas hadiahnya." 🙂`, {
          icon: "🎁",
          duration: 3000,
        });
      }

      if (result.leveledUp) {
        toast.success(
          `🎉 Level Persahabatan dengan ${npcData.name} naik ke Level ${result.newLevel}!`,
        );
      }
    } else {
      toast.error("Gagal memberikan hadiah.");
    }

    closeModals();
  };

  const targetNpc = modals.npcGift.npcId
    ? NPC_LIST.find((n) => n.id === modals.npcGift.npcId)
    : null;

  return (
    <>
      <OfflineProgressModal />

      <AnimatePresence>
        {modals.confirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel max-w-sm w-full"
            >
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
                {modals.confirm.title}
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 font-medium">
                {modals.confirm.msg}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={closeModals}>
                  Batal
                </Button>
                <Button variant="primary" onClick={handleConfirmSubmit}>
                  Ya
                </Button>
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
              className="glass-panel max-w-sm w-full"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2 drop-shadow-sm">🛒</div>
                <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                  {modals.prompt.title}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium">
                  {modals.prompt.msg}
                </p>
              </div>
              <QtyControl
                size="lg"
                value={promptValue}
                editable
                onChange={setPromptValue}
                onDecrease={() => setPromptValue(Math.max(1, promptValue - 1))}
                onIncrease={() => setPromptValue(promptValue + 1)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="lg" onClick={closeModals}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePromptSubmit}
                >
                  Beli
                </Button>
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
              className="glass-panel max-w-md w-full"
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2 drop-shadow-md">
                  {targetNpc.emoji}
                </div>
                <h2 className="text-2xl font-display font-black text-[var(--text-primary)]">
                  {targetNpc.name}
                </h2>
                <p className="text-[var(--primary-dark)] font-bold text-sm bg-[var(--primary-light)]/30 inline-block px-3 py-1 rounded-full border border-[var(--primary)]/40 mt-1">
                  {targetNpc.role}
                </p>
                <p className="text-[var(--text-secondary)] text-sm mt-3 font-medium">
                  Pilih barang dari inventory Anda untuk diberikan sebagai
                  hadiah.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6 max-h-[150px] overflow-y-auto p-3 glass-card rounded-xl">
                {Object.keys(inventory).length === 0 && (
                  <div className="col-span-5 text-center text-xs text-[var(--text-secondary)] py-4 font-bold">
                    Inventory kosong...
                  </div>
                )}
                {Object.entries(inventory).map(
                  ([item, amount]) =>
                    amount > 0 && (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSelectedGift(item)}
                        className={`relative w-16 h-16 rounded-xl flex items-center justify-center transition-all border-2 ${
                          selectedGift === item
                            ? "bg-[var(--gold)]/20 border-[var(--gold)] shadow-inner scale-105"
                            : "bg-white/50 border-[var(--wood-light)] hover:bg-white"
                        }`}
                      >
                        <span className="text-3xl drop-shadow-md">
                          {getCropEmoji(item)}
                        </span>
                        <span className="absolute -bottom-2 -right-2 bg-[var(--card)] text-[var(--text-primary)] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm border-2 border-[var(--wood-light)]">
                          {inventory[item]}
                        </span>
                      </button>
                    ),
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="lg" onClick={closeModals}>
                  Batal
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleGiveGift}
                  disabled={!selectedGift}
                >
                  Beri Hadiah 🎁
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
