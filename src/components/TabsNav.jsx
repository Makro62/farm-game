'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TabsNav() {
  const pathname = usePathname();

  const tabs = [
    { id: 'pertanian', label: 'Ladang', emoji: '🌱' },
    { id: 'peternakan', label: 'Ternak', emoji: '🐄' },
    { id: 'tambang', label: 'Tambang', emoji: '⛏️' },
    { id: 'kota', label: 'Kota', emoji: '🏪' },
    { id: 'restoran', label: 'Restoran', emoji: '🍰' },
  ];

  return (
    <div className="tab-pill-shell flex p-1 sm:p-1.5 overflow-x-auto scrollbar-hide flex-nowrap w-max mx-auto">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(`/${tab.id}`);
        return (
          <Link
            key={tab.id}
            href={`/${tab.id}`}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-sm transition-colors duration-300 min-w-[64px] sm:min-w-[104px]
              ${isActive ? 'text-[var(--text-primary)]' : 'text-[#FFF1D6]/85 hover:text-white hover:bg-white/10'}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-[#9FE870] to-[#5DBE4A] shadow-md border-2 border-[#C8F0B0]"
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            )}
            <span className={`relative z-10 text-base sm:text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : ''}`}>
              {tab.emoji}
            </span>
            <span className="relative z-10 tracking-wide hidden md:inline-block font-display uppercase text-[11px] sm:text-xs">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
