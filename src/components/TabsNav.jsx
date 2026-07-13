'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TabsNav() {
  const pathname = usePathname();
  
  const tabs = [
    { id: 'pertanian', label: 'Pertanian', emoji: '🌱' },
    { id: 'peternakan', label: 'Peternakan', emoji: '🐄' },
    { id: 'tambang', label: 'Tambang', emoji: '⛏️' },
    { id: 'kota', label: 'Kota', emoji: '🏪' }
  ];

  return (
    <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 shadow-inner border border-white/10 overflow-x-auto hide-scrollbar flex-nowrap w-max mx-auto pointer-events-auto">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(`/${tab.id}`);
        return (
          <Link
            key={tab.id}
            href={`/${tab.id}`}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-[11px] sm:text-sm transition-colors duration-300 min-w-[60px] sm:min-w-[100px]
              ${isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 text-sm sm:text-lg transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : ''}`}>
              {tab.emoji}
            </span>
            <span className="relative z-10 tracking-wide hidden md:inline-block">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
