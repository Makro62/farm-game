// ===== BUILDING CONFIGURATION =====
// Single source of truth for all building data.
// Includes: shop info, mineral requirements, and initial state shape.

export interface BuildingConfig {
  id: string
  name: string
  emoji: string
  price: number
  desc: string
  unlockLevel: number
  buyable?: boolean
  mineralReq?: Record<string, number>
  initialShape: {
    unlocked: boolean
    level: number
    maxLevel?: number
    capacity?: number
    queue?: any[]
  }
}

export const BUILDING_CONFIG: Record<string, BuildingConfig> = {
  silo: {
    id: 'silo',
    name: 'Silo',
    emoji: '🏚️',
    price: 2000,
    desc: 'Hasil jual tanaman +15%',
    unlockLevel: 5,
    buyable: true,
    mineralReq: { batu: 20, besi: 10 },
    initialShape: { unlocked: true, level: 1, maxLevel: 3 },
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🏠',
    price: 5000,
    desc: 'Tanam bibit luar musim',
    unlockLevel: 5,
    buyable: true,
    mineralReq: { batu: 30, tembaga: 15, emas: 5 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  scarecrow: {
    id: 'scarecrow',
    name: 'Scarecrow',
    emoji: '🪄',
    price: 1500,
    desc: 'Cegah hama menyerang ladang',
    unlockLevel: 5,
    buyable: true,
    mineralReq: { batu: 35, besi: 5 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  sprinkler: {
    id: 'sprinkler',
    name: 'Sprinkler Irigasi',
    emoji: '🚿',
    price: 2500,
    desc: 'Siram semua tanaman otomatis setiap hari',
    unlockLevel: 5,
    buyable: true,
    mineralReq: { besi: 15, tembaga: 10 },
    initialShape: { unlocked: true, level: 1, maxLevel: 1 },
  },
  mill: {
    id: 'mill',
    name: 'Mill',
    emoji: '⚙️',
    price: 0,
    desc: 'Olah hasil pertanian menjadi produk',
    unlockLevel: 1,
    buyable: false,
    initialShape: { unlocked: false, level: 0, queue: [] },
  },
  well: {
    id: 'well',
    name: 'Sumur',
    emoji: '🪣',
    price: 0,
    desc: 'Sumber air untuk irigasi',
    unlockLevel: 1,
    buyable: false,
    initialShape: { unlocked: true, level: 1, maxLevel: 3 },
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    emoji: '🔨',
    price: 0,
    desc: 'Crafting item dan alat',
    unlockLevel: 1,
    buyable: false,
    initialShape: { unlocked: false, level: 0, maxLevel: 3 },
  },
  coop: {
    id: 'coop',
    name: 'Coop',
    emoji: '🐔',
    price: 0,
    desc: 'Kandang unggas',
    unlockLevel: 1,
    buyable: false,
    initialShape: { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
  },
  barn: {
    id: 'barn',
    name: 'Barn',
    emoji: '🐄',
    price: 0,
    desc: 'Kandang hewan besar',
    unlockLevel: 1,
    buyable: false,
    initialShape: { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
  },
}

// Helper to get building config
export function getBuildingConfig(buildingId: string): BuildingConfig | null {
  return BUILDING_CONFIG[buildingId] || null
}

// Helper to get mineral requirements for a building
export function getBuildingMineralReq(
  buildingId: string
): Record<string, number> | null {
  return BUILDING_CONFIG[buildingId]?.mineralReq || null
}

// Helper to get initial shape for a building
export function getBuildingInitialShape(buildingId: string) {
  return (
    BUILDING_CONFIG[buildingId]?.initialShape || { unlocked: true, level: 1 }
  )
}

export const SHOP_BUILDINGS = Object.values(BUILDING_CONFIG).filter(
  building => building.buyable
)
