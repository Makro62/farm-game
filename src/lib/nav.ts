export type NavTab = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  unlockLevel: number;
};

export const NAV_TABS: NavTab[] = [
  { id: "pertanian", label: "Ladang", emoji: "🌱", href: "/pertanian", unlockLevel: 1 },
  { id: "peternakan", label: "Ternak", emoji: "🐄", href: "/peternakan", unlockLevel: 3 },
  { id: "tambang", label: "Tambang", emoji: "⛏️", href: "/tambang", unlockLevel: 5 },
  { id: "kota", label: "Kota", emoji: "🏪", href: "/kota", unlockLevel: 8 },
  { id: "restoran", label: "Restoran", emoji: "🍰", href: "/restoran", unlockLevel: 10 },
  { id: "profil", label: "Profil", emoji: "🧑‍🌾", href: "/profil", unlockLevel: 1 },
];

export const SEASON_META: Record<string, { emoji: string; label: string }> = {
  spring: { emoji: "🌸", label: "Semi" },
  summer: { emoji: "☀️", label: "Panas" },
  autumn: { emoji: "🍂", label: "Gugur" },
  winter: { emoji: "❄️", label: "Dingin" },
};
