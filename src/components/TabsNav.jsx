'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TabsNav() {
  const pathname = usePathname();

  const tabs = [
    { id: 'pertanian', label: 'Pertanian', emoji: '🌱', color: 'from-[#A8E0A4] to-[#7BC47F]' },
    { id: 'peternakan', label: 'Peternakan', emoji: '🐄', color: 'from-[#B8E4FF] to-[#7EB8E8]' },
    { id: 'tambang', label: 'Tambang', emoji: '⛏️', color: 'from-[#E8D5B5] to-[#C4A574]' },
    { id: 'kota', label: 'Kota', emoji: '🏪', color: 'from-[#FFE08A] to-[#F5C84C]' },
    { id: 'restoran', label: 'Restoran', emoji: '🍰', color: 'from-[#FFB3AA] to-[#EF5350]' },
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
              ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/40'}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className={`absolute inset-0 bg-gradient-to-b ${tab.color} rounded-full shadow-md border-2 border-white/60`}
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
