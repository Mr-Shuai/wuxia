import type { BattleDefinition } from '../types'

export const battles: Record<string, BattleDefinition> = {
  'bandit-ambush': {
    id: 'bandit-ambush',
    title: '古道伏击',
    enemy: {
      id: 'bandit',
      name: '拦路匪徒',
      hp: 22,
      qi: 6,
      poise: 8,
      attack: 7,
      defense: 2,
    },
  },
  'inn-duel': {
    id: 'inn-duel',
    title: '酒楼比武',
    enemy: {
      id: 'inn-guard',
      name: '酒楼护卫',
      hp: 26,
      qi: 8,
      poise: 10,
      attack: 8,
      defense: 3,
    },
  },
  'guard-skirmish': {
    id: 'guard-skirmish',
    title: '后厨缠斗',
    enemy: {
      id: 'kitchen-guard',
      name: '账房护卫',
      hp: 20,
      qi: 6,
      poise: 9,
      attack: 7,
      defense: 2,
    },
  },
}
