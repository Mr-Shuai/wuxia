import type { OriginDefinition, OriginId } from '../types'

export const origins: Record<OriginId, OriginDefinition> = {
  scholar: {
    id: 'scholar',
    name: '破落书生',
    description: '懂礼数、善察言观色，但筋骨未成。',
    base: { maxHp: 24, maxQi: 12, maxPoise: 9, attack: 7, defense: 3 },
  },
  wanderer: {
    id: 'wanderer',
    name: '江湖浪客',
    description: '久走四方，出手利落，最会见机行事。',
    base: { maxHp: 28, maxQi: 10, maxPoise: 10, attack: 8, defense: 4 },
  },
  escort: {
    id: 'escort',
    name: '镖局子弟',
    description: '从小练身板，守得住阵，也吃得住苦。',
    base: { maxHp: 32, maxQi: 8, maxPoise: 12, attack: 7, defense: 5 },
  },
}
