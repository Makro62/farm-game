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
  health?: number
  readyToCollect?: boolean

  [key: string]: unknown
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

export interface SmelteryJob {
  recipe: string
  input: Record<string, number>
  output: string
  completeAt: number
}

export interface SmelteryState {
  unlocked: boolean
  level: number
  queue: SmelteryJob[]
  fuel: number
}

export interface MiningHazard {
  id?: string | number
  type: string
  nodeId?: number

  [key: string]: unknown
}

export interface MiningState {
  currentFloor: number
  maxFloorReached: number
  nodes: MiningNode[]
  pickaxeLevel: number
  lanternUntil: number | null
  hazards: MiningHazard[]
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
  queue?: CraftingJob[]
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
  deltaSeconds?: number
  earnedCoins?: number
  harvestedCrops?: number
  collectedProducts?: number
  caughtFishes?: number
  minedGems?: number
  maturedCrops?: number
  maturedNodes?: number

  [key: string]: unknown
}

export interface CraftingJob {
  id?: string | number
  recipeId?: string
  startTime: number
  duration: number

  [key: string]: unknown
}

export interface GameOrderItem {
  id: string
  qty: number

  [key: string]: unknown
}

export interface GameOrder {
  id: string | number
  items?: GameOrderItem[]
  reward?: number
  /** legacy template fields carried over by generateOrders */
  coins?: number
  xp?: number
  tier?: number
  timer?: number
  createdAt?: number

  [key: string]: unknown
}

export interface ActiveCustomer {
  id: string | number
  typeId?: string
  name?: string
  emoji?: string
  recipeId: string
  tableId?: number
  patience: number
  maxPatience: number
  spawnTime?: number
  tipMultiplier: number
  /** golden VIP: pays VIP_PRICE_MULT, shorter patience */
  isVip?: boolean

  [key: string]: unknown
}

export interface GameNotification {
  id?: string | number
  message?: string
  type?: string
  options?: NotificationOptions

  [key: string]: unknown
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
  /** timestamp ms until which rush-hour tips apply */
  rushUntil?: number
  /** game day number the dailySpecial was rolled for */
  lastSpecialDay?: number
  /** consecutive serves for rush combo */
  serveStreak?: number
  lastServedAt?: number
}

export interface MuseumDonation {
  itemId: string
  points: number
  donatedAt?: number
}

export interface TownState {
  museumDonations: MuseumDonation[]
  bankSavings: number
  bankInterestRate: number
}

export interface ActiveEvent {
  id?: string
  name?: string
  priceModifiers?: Record<string, number>

  [key: string]: unknown
}

export type MarketTrend = 'boom' | 'crash' | 'up' | 'down' | string

export interface DailyQuestChain {
  type: string
  targetId: string
  amount: number
}

export interface DailyQuest {
  id?: string
  type: string
  action: string
  targetId: string
  targetName?: string
  count: number
  required: number
  rewardCoins: number
  rewardXp: number
  claimed: boolean
  completed?: boolean
  chain?: DailyQuestChain[]
}

export interface DecorationItem {
  id: string
  boughtAt?: number

  [key: string]: unknown
}

export interface QuestProgressEntry {
  type: string
  targetId: string
  amount?: number
}

export interface NotificationOptions {
  id?: string | number
  icon?: string
  duration?: number
  type?: string
}

export interface AchievementState {
  unlocked?: boolean
  unlockedAt?: number

  [key: string]: unknown
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
  lastLogin: string | number | null
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
  marketTrend: Record<string, MarketTrend>

  // NB: lastLogin/lastWheelSpin hold date strings (toDateString) at runtime
  // for streak/spin checks, despite the numeric-looking names.
  lastWheelSpin: string | number | null
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

  dailyQuests: DailyQuest[]
  lastQuestDate: string | null
  workerAutoMigrated: boolean

  craftingQueue: CraftingJob[]
  orders: GameOrder[]

  totalTables: number
  buildings: Record<string, BuildingLevel>
  decorations: string[]
  tutorialStep: number

  achievements: Record<string, AchievementState>
  sessionActions: Record<string, boolean>
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
