export type GamePhase = 'start' | 'create' | 'story' | 'exploration' | 'battle' | 'ending'

export type OriginId = 'scholar' | 'wanderer' | 'escort'
export type TalentId = 'steady-heart' | 'keen-eye' | 'iron-bone'

export interface GameState {
  name: string
  origin: OriginId
  talent: TalentId
  silver: number
  maxHp: number
  hp: number
  maxQi: number
  qi: number
  maxPoise: number
  poise: number
  attack: number
  defense: number
  morality: number
  wantedLevel: number
  reputation: number
  debt: number
  favorSword: number
  favorBlackMarket: number
  inventory: string[]
  martialSkills: string[]
  exploredScenes: string[]
  activeWeaponId?: string
  currentExplorationMapId?: string
  explorationReturnNodeId?: string
  completedMapNodes: string[]
  purchasedShopItems: string[]
  completedSideQuests: string[]
  currentNodeId: string
  visitedNodes: string[]
  flags: Record<string, boolean>
  chapterLogs: string[]
}

export interface ExplorationReward {
  weaponId?: string
  martialSkillId?: string
  itemId?: string
}

export interface WeaponDefinition {
  id: string
  name: string
  description: string
  attackBonus: number
  defenseBonus?: number
}

export interface ShopItemDefinition {
  id: string
  name: string
  description: string
  price: number
  reward: ExplorationReward
  once?: boolean
}

export interface SideQuestDefinition {
  id: string
  title: string
  description: string
  log: string
  reward?: ExplorationReward
  effects?: ChoiceEffects
}

export interface ExplorationMapNode {
  id: string
  title: string
  description: string
  type: 'shop' | 'sidequest' | 'training' | 'intel' | 'exit'
  once?: boolean
  requires?: ChoiceRequirements
  reward?: ExplorationReward
  log?: string
  shopItems?: ShopItemDefinition[]
  quest?: SideQuestDefinition
}

export interface ExplorationMapDefinition {
  id: string
  title: string
  summary: string
  location: string
  returnNodeId: string
  nodes: ExplorationMapNode[]
}

export interface MartialSkillDefinition {
  id: string
  name: string
  description: string
  attackBonus?: number
  poiseBonus?: number
}

export interface ExplorationAction {
  id: string
  text: string
  log: string
  once?: boolean
  nextNodeId: string
  rewards?: ExplorationReward
  stats?: Partial<Record<StatEffectKey, number>>
  requires?: ChoiceRequirements
}

export interface ExplorationScene {
  id: string
  title: string
  location: string
  description: string[]
  actions: ExplorationAction[]
}

export interface OriginDefinition {
  id: OriginId
  name: string
  description: string
  base: {
    maxHp: number
    maxQi: number
    maxPoise: number
    attack: number
    defense: number
  }
}

export interface TalentDefinition {
  id: TalentId
  name: string
  description: string
  bonus: {
    maxHp: number
    maxQi: number
    maxPoise: number
    attack: number
    defense: number
  }
}

export type StatEffectKey =
  | 'morality'
  | 'wantedLevel'
  | 'reputation'
  | 'debt'
  | 'favorSword'
  | 'favorBlackMarket'
  | 'hp'
  | 'qi'
  | 'poise'

export interface ChoiceEffects {
  log: string
  stats?: Partial<Record<StatEffectKey, number>>
  flags?: Record<string, boolean>
  rewards?: ExplorationReward
}

export interface ChoiceRequirements {
  flags?: Record<string, boolean>
  minStats?: Partial<Record<StatEffectKey, number>>
  martialSkills?: string[]
  inventory?: string[]
  exploredScenes?: string[]
}

export interface StoryChoice {
  id: string
  text: string
  nextNodeId: string
  effects: ChoiceEffects
  battleId?: string
  requires?: ChoiceRequirements
}

export interface StoryNode {
  id: string
  title: string
  location: string
  content: string[]
  choices: StoryChoice[]
}

export interface EndingDefinition {
  id: string
  title: string
  summary: string
  tone: string
  nextNodeId?: string
  continueText?: string
  condition: (state: GameState) => boolean
}

export type PlayerAction = 'attack' | 'focus' | 'guard' | 'break'

export interface BattleEnemy {
  id: string
  name: string
  hp: number
  qi: number
  poise: number
  attack: number
  defense: number
}

export interface BattleDefinition {
  id: string
  title: string
  enemy: BattleEnemy
}

export interface BattleState {
  title: string
  player: Pick<GameState, 'hp' | 'qi' | 'poise' | 'attack' | 'defense' | 'maxHp' | 'maxQi' | 'maxPoise'>
  enemy: BattleEnemy
  log: string[]
  outcome: 'ongoing' | 'victory' | 'defeat'
}
