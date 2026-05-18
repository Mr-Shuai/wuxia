import { INITIAL_NODE_ID } from '../constants'
import { origins } from '../data/origins'
import { talents } from '../data/talents'
import type { GameState, OriginId, TalentId } from '../types'

interface CreateGameStateInput {
  name: string
  originId: OriginId
  talentId: TalentId
}

export function createGameState(input: CreateGameStateInput): GameState {
  const origin = origins[input.originId]
  const talent = talents[input.talentId]

  const maxHp = origin.base.maxHp + talent.bonus.maxHp
  const maxQi = origin.base.maxQi + talent.bonus.maxQi
  const maxPoise = origin.base.maxPoise + talent.bonus.maxPoise

  return {
    name: input.name,
    origin: input.originId,
    talent: input.talentId,
    silver: 12,
    maxHp,
    hp: maxHp,
    maxQi,
    qi: maxQi,
    maxPoise,
    poise: maxPoise,
    attack: origin.base.attack + talent.bonus.attack,
    defense: origin.base.defense + talent.bonus.defense,
    morality: 0,
    wantedLevel: 0,
    reputation: 0,
    debt: 0,
    favorSword: 0,
    favorBlackMarket: 0,
    inventory: [],
    martialSkills: [],
    exploredScenes: [],
    activeWeaponId: undefined,
    currentExplorationMapId: undefined,
    explorationReturnNodeId: undefined,
    completedMapNodes: [],
    purchasedShopItems: [],
    completedSideQuests: [],
    currentNodeId: INITIAL_NODE_ID,
    visitedNodes: [INITIAL_NODE_ID],
    flags: {
      savedSpy: false,
      keptScroll: false,
      soldScroll: false,
      wonInnDuel: false,
      wonNightRaid: false,
      lostNightRaid: false,
      choseRighteousVerdict: false,
      choseBlackMarketVerdict: false,
      choseSecretVerdict: false,
      choseNeutralVerdict: false,
    },
    chapterLogs: ['你踏入了风雨欲来的江湖。'],
  }
}
