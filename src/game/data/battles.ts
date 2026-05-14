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
  'night-raid-captain': {
    id: 'night-raid-captain',
    title: '渡口夜战',
    enemy: {
      id: 'night-raid-captain',
      name: '夜袭统领',
      hp: 30,
      qi: 8,
      poise: 11,
      attack: 9,
      defense: 3,
    },
  },
  'salt-port-enforcer': {
    id: 'salt-port-enforcer',
    title: '夜封盐港',
    enemy: {
      id: 'salt-port-enforcer',
      name: '私盐护头',
      hp: 22,
      qi: 7,
      poise: 9,
      attack: 7,
      defense: 2,
    },
  },
}
