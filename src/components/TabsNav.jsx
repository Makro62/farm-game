'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TabsNav() {
  const pathname = usePathname();

  const tabs = [
    { id: 'pertanian', label: 'Pertanian', emoji: '🌱', color: 'from-[#6fbf55] to-[#2f6b3a]' },
    { id: 'peternakan', label: 'Peternakan', emoji: '🐄', color: 'from-[#8fd3ff] to-[#3d8fd1]' },
    { id: 'tambang', label: 'Tambang', emoji: '⛏️', color: 'from-[#c4b5a0] to-[#6b5b4a]' },
    { id: 'kota', label: 'Kota', emoji: '🏪', color: 'from-[#ffe08a] to-[#d97706]' },
  ];

  return (
    <div className="tab-pill-shell flex rounded-full p-1 overflow-x-auto scrollbar-hide flex-nowrap w-max mx-auto">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(`/${tab.id}`);
        return (
          <Link
            key={tab.id}
            href={`/${tab.id}`}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-sm transition-colors duration-300 min-w-[64px] sm:min-w-[112px]
              ${isActive ? 'text-white' : 'text-[#f7f4e8]/65 hover:text-white hover:bg-white/5'}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className={`absolute inset-0 bg-gradient-to-b ${tab.color} rounded-full shadow-lg border-2 border-white/25`}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            )}
            <span className={`relative z-10 text-base sm:text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : ''}`}>
              {tab.emoji}
            </span>
            <span className="relative z-10 tracking-wide hidden md:inline-block font-display">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
