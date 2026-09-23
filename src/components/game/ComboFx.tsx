"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";

export default function ComboFx() {
  const count = useGameStore((s) => s.combo?.count ?? 0);
  const multiplier = useGameStore((s) => s.combo?.multiplier ?? 1);
  const active = count >= GAME_CONSTANTS.COMBO.THRESHOLD;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.7 }}
          style={{ x: "-50%" }}
          className="fixed bottom-24 left-1/2 z-[60] pointer-events-none select-none"
        >
          <motion.div
            key={count}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 480, damping: 16 }}
            className="flex items-center gap-2 rounded-full border border-yellow-300/60 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-4 py-2 text-sm font-black text-white shadow-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          >
            <span className="text-base">🔥</span>
            <span>{count}x COMBO</span>
            <span className="text-yellow-200">
              ×{Math.round(multiplier * 100) / 100}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
