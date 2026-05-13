export type GamePhase = 'start' | 'create' | 'story' | 'battle' | 'result' | 'ending'

export type OriginId = 'scholar' | 'wanderer' | 'escort'
export type TalentId = 'steady-heart' | 'keen-eye' | 'iron-bone'

export interface GameState {
  name: string
  origin: OriginId
  talent: TalentId
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
  currentNodeId: string
  visitedNodes: string[]
  flags: Record<string, boolean>
  chapterLogs: string[]
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
}

export interface StoryChoice {
  id: string
  text: string
  nextNodeId: string
  effects: ChoiceEffects
  battleId?: string
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
  player: Pick<GameState, 'hp' | 'qi' | 'poise' | 'attack' | 'defense' | 'maxHp' | 'maxQi' | 'maxPoise'>
  enemy: BattleEnemy
  log: string[]
  outcome: 'ongoing' | 'victory' | 'defeat'
}
