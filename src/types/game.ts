/** Domain + Zustand store types for Farm Tycoon */

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter'

export type PlotStatus = 'empty' | 'growing' | 'ready'

export interface Plot {
  id: number
  status: PlotStatus | string
  crop: string | null
  plantedAt: number | null
  growTime: number | null
  watered: boolean
  fertilizer: string | null
  quality: string | null
  pestInfestation: boolean
  greenhouse: boolean
  level: number
}

export interface InventoryStack {
  qty: number
  quality?: string | null
  acquiredAt?: number
}

export type InventoryCategory =
  | 'crops'
  | 'animalProducts'
  | 'minerals'
  | 'fish'
  | 'processed'
  | 'cooked'
  | 'seeds'
  | 'tools'
  | 'bait'
  | 'collectibles'
  | 'consumables'

export type InventoryByCategory = Record<
  InventoryCategory,
  Record<string, InventoryStack>
>

export interface Animal {
  id: string | number
  type: string
  name?: string
  status: string
  lastCollected: number
  produceTime: number
  fed?: boolean
  happiness?: number
   
  [key: string]: any
}

export type WorkerRole = 'farmer' | 'rancher' | 'fisher' | 'miner' | 'chef'

export interface Worker {
  name: string
  role: WorkerRole | string
  level: number
  xp: number
  xpToNext: number
  stamina: number
  happiness: number
  wagePerDay: number
  daysEmployed: number
  totalWagesPaid: number
  loyalty: number
  skills: Record<string, number>
  isWorking: boolean
  isAutoMode: boolean
  hired?: boolean
  maxStamina?: number
}

export interface MiningNode {
  id: number
  status: string
  type: string
  regenAt: number | null
  hazard: string | null
}

export interface SmelteryState {
  unlocked: boolean
  level: number
  queue: any[]
  fuel: number
}

export interface MiningState {
  currentFloor: number
  maxFloorReached: number
  nodes: MiningNode[]
  pickaxeLevel: number
  lanternUntil: number | null
  hazards: any[]
  smeltery: SmelteryState
}

export interface NpcRelation {
  level: number
  points: number
  hearts: number
  dailyGiftGiven: boolean
  questsCompleted: string[]
}

export interface BuildingLevel {
  unlocked: boolean
  level: number
  maxLevel?: number
  capacity?: number
  queue?: any[]
}

export interface WeatherEffects {
  cropGrowth: number
  miningRegen: number
  animalProduce: number
  fishingRare: number
  customerRate: number
}

export interface GameStats {
  totalHarvested: number
  totalMined: number
  totalFished: number
  totalCooked: number
  totalServed: number
  totalCollected: number
  totalOrdersFulfilled: number
  totalGiftsGiven: number
  totalFertilizerUsed: number
  totalFertilizerDropped: number
  totalAnimalsFed: number
  totalAnimalsOwned: number
  totalWormsFound: number
  totalWormBaitUsed: number
  totalDiamondsMined: number
  totalSushiEmasMade: number
  [key: string]: number
}

export interface ModalState {
  isOpen: boolean
  title: string
  msg: string
  onConfirm: (() => void) | null
}

export interface OfflineReport {
  seconds?: number
  coins?: number
  summary?: string[]
   
  [key: string]: any
}

export interface CraftingJob {
  id?: string | number
  recipeId?: string
  startTime: number
  duration: number
   
  [key: string]: any
}

export interface GameOrder {
  id: string | number
  items?: { id: string; qty: number; [key: string]: any }[]
  reward?: number
  timer?: number
  createdAt?: number
   
  [key: string]: any
}

export interface ActiveCustomer {
  id: string | number
   
  [key: string]: any
}

export interface GameNotification {
  id?: string | number
  message?: string
  type?: string
   
  [key: string]: any
}

export interface SeasonState {
  current: SeasonId | string
  day: number
  tick: number
}

export interface WeatherState {
  current: string
  nextChangeIn: number
  forecast: string[]
}

export interface ComboState {
  count: number
  multiplier: number
  lastAction: number
}

export interface RestaurantState {
  reputation: number
  dailySpecial: string | null
  serviceOn: boolean
}

export interface TownState {
  museumDonations: any[]
  bankSavings: number
  bankInterestRate: number
}

export interface ActiveEvent {
  id?: string
  name?: string
   
  [key: string]: any
}

/** Persisted / base game state (no actions) */
export interface GameState {
  coins: number
  level: number
  xp: number
  energy: number
  maxEnergy: number
  day: number
  streak: number
  lastLogin: number | null
  lastSavedAt: number
  offlineReport: OfflineReport | null

  plots: Plot[]
  feedPlots: Plot[]
  kitchenPlots: Plot[]
  inventoryByCategory: InventoryByCategory
  animals: Animal[]

  soundEnabled: boolean
  musicEnabled: boolean
  notificationsEnabled: boolean

  todayPrices: Record<string, number>
  marketTrend: Record<string, any>

  lastWheelSpin: number | null
  coinMultiplier: number
  growthMultiplier: number

  workers: Partial<Record<WorkerRole, Worker | null>>

  selectedSeed: string | null
  selectedMiningTool: string | null
  selectedBait: string | null
  selectedRecipe: string | null

  modals: {
    prompt: ModalState
    confirm: ModalState
    npcGift: { isOpen: boolean; npcId: string | null }
  }

  combo: ComboState
  season: SeasonState
  weather: WeatherState
  mining: MiningState
  npcs: Record<string, NpcRelation>
  activeEvent: ActiveEvent | null

  dailyQuests: any[]
  lastQuestDate: string | null
  workerAutoMigrated: boolean

  craftingQueue: CraftingJob[]
  orders: GameOrder[]

  totalTables: number
  buildings: Record<string, BuildingLevel>
  decorations: any[]
  tutorialStep: number

  achievements: Record<string, any>
  sessionActions: Record<string, any>
  weatherEffects: WeatherEffects
  stats: GameStats
  activeCustomers: ActiveCustomer[]
  notificationsQueue: GameNotification[]

  restaurant: RestaurantState
  town: TownState
}

/** Slice set/get helpers — wide to match zustand+immer call shapes */
 
export type StoreSet = (...args: any[]) => void
export type StoreGet = () => GameStore

/**
 * Actions live on the same store object. Use a wide index so slice methods
 * are callable without listing every action signature here.
 */
 
export type GameActions = {
  resetGame: () => boolean
   
  [key: string]: any
}

export type GameStore = GameState & GameActions
