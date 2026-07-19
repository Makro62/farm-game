"use client";
import { useGameStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  {
    id: 0,
    text: "Selamat datang! Langkah 1: Beli Bibit Wortel di Toko.",
    target: '[data-tutorial="shop-seed"]',
  },
  {
    id: 1,
    text: "Langkah 2: Buka tab Pertanian, lalu klik petak tanah kosong untuk menanam.",
    target: '[data-tutorial="farm-plot"]',
  },
  {
    id: 2,
    text: "Langkah 3: Tunggu hingga siap, lalu klik untuk panen!",
    target: '[data-tutorial="farm-plot-ready"]',
  },
  { id: 3, text: "Hebat! Anda siap mengelola pertanian Anda.", target: null },
];

export default function TutorialOverlay() {
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const completeTutorialStep = useGameStore(
    (state) => state.completeTutorialStep,
  );
  const skipTutorial = useGameStore((state) => state.skipTutorial);

  const [targetRect, setTargetRect] = useState(null);

  const currentStep = steps.find((s) => s.id === tutorialStep);

  useEffect(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect((prev) => {
          if (!prev) return rect;
          if (
            prev.top === rect.top &&
            prev.left === rect.left &&
            prev.width === rect.width &&
            prev.height === rect.height
          ) {
            return prev;
          }
          return rect;
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();

    // Polling to keep it attached to the target even if it moves/re-renders
    const interval = setInterval(updateRect, 500);
    return () => clearInterval(interval);
  }, [tutorialStep, currentStep]);

  if (
    tutorialStep === undefined ||
    tutorialStep === null ||
    tutorialStep === -1 ||
    !currentStep
  )
    return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`step-${tutorialStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm pointer-events-none"
      >
        {targetRect && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top - 10,
              left: targetRect.left - 10,
              width: targetRect.width + 20,
              height: targetRect.height + 20,
              border: "4px dashed #FBBF24",
              borderRadius: "12px",
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.8)",
            }}
          />
        )}

        {/* Tooltip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white p-6 rounded-3xl shadow-2xl pointer-events-auto text-center border-4 border-amber-200">
          <p className="text-lg font-bold text-[var(--text-primary)] mb-5">
            {currentStep.text}
          </p>
          <div className="flex gap-3 justify-center">
            {tutorialStep === 3 ? (
              <button
                onClick={() => skipTutorial()}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
              >
                Mulai Bermain! 🚀
              </button>
            ) : (
              <>
                <button
                  onClick={() => completeTutorialStep(tutorialStep)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Lanjut
                </button>
                <button
                  onClick={skipTutorial}
                  className="text-gray-400 hover:text-gray-600 px-4 py-2 text-sm font-semibold"
                >
                  Lewati
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
