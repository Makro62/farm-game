// ===== BUILDING CONFIGURATION =====
// Single source of truth for all building data.
// Includes: shop info, mineral requirements, and initial state shape.

export interface BuildingConfig {
  id: string;
  name: string;
  emoji: string;
  price: number;
  desc: string;
  mineralReq?: Record<string, number>;
  initialShape: {
    unlocked: boolean;
    level: number;
    maxLevel?: number;
    capacity?: number;
    queue?: any[];
  };
}

export const BUILDING_CONFIG: Record<string, BuildingConfig> = {
  silo: {
    id: "silo",
    name: "Silo",
    emoji: "🏚️",
    price: 2000,
    desc: "Hasil jual tanaman +15%",
    mineralReq: { batu: 20, besi: 10 },
    initialShape: { unlocked: true, level: 1, maxLevel: 3 },
  },
  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse",
    emoji: "🏠",
    price: 5000,
    desc: "Tanam bibit luar musim",
    mineralReq: { batu: 30, tembaga: 15, emas: 5 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  scarecrow: {
    id: "scarecrow",
    name: "Scarecrow",
    emoji: "🪄",
    price: 1500,
    desc: "Cegah hama menyerang ladang",
    mineralReq: { batu: 35, besi: 5 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  sprinkler: {
    id: "sprinkler",
    name: "Sprinkler Irigasi",
    emoji: "🚿",
    price: 2500,
    desc: "Siram semua tanaman otomatis setiap hari",
    mineralReq: { besi: 15, tembaga: 10 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  mill: {
    id: "mill",
    name: "Mill",
    emoji: "⚙️",
    price: 3000,
    desc: "Olah hasil pertanian menjadi produk",
    initialShape: { unlocked: true, level: 1, queue: [] },
  },
  well: {
    id: "well",
    name: "Sumur",
    emoji: "🪣",
    price: 1800,
    desc: "Sumber air untuk irigasi",
    initialShape: { unlocked: true, level: 1, maxLevel: 3 },
  },
  workshop: {
    id: "workshop",
    name: "Workshop",
    emoji: "🔨",
    price: 4000,
    desc: "Crafting item dan alat",
    initialShape: { unlocked: true, level: 1, maxLevel: 3 },
  },
  coop: {
    id: "coop",
    name: "Coop",
    emoji: "🐔",
    price: 3500,
    desc: "Kandang unggas",
    initialShape: { unlocked: true, level: 1, maxLevel: 3, capacity: 6 },
  },
  barn: {
    id: "barn",
    name: "Barn",
    emoji: "🐄",
    price: 4500,
    desc: "Kandang hewan besar",
    initialShape: { unlocked: true, level: 1, maxLevel: 3, capacity: 6 },
  },
};

// Helper to get building config
export function getBuildingConfig(buildingId: string): BuildingConfig | null {
  return BUILDING_CONFIG[buildingId] || null;
}

// Helper to get mineral requirements for a building
export function getBuildingMineralReq(buildingId: string): Record<string, number> | null {
  return BUILDING_CONFIG[buildingId]?.mineralReq || null;
}

// Helper to get initial shape for a building
export function getBuildingInitialShape(buildingId: string) {
  return BUILDING_CONFIG[buildingId]?.initialShape || { unlocked: true, level: 1 };
}
