import type { TalentDefinition, TalentId } from '../types'

export const talents: Record<TalentId, TalentDefinition> = {
  'steady-heart': {
    id: 'steady-heart',
    name: '稳心',
    description: '心神沉定，调息更稳，起手内力更足。',
    bonus: { maxHp: 0, maxQi: 4, maxPoise: 1, attack: 0, defense: 0 },
  },
  'keen-eye': {
    id: 'keen-eye',
    name: '听风',
    description: '眼快耳敏，更容易看破人心与局势。',
    bonus: { maxHp: 0, maxQi: 1, maxPoise: 0, attack: 1, defense: 0 },
  },
  'iron-bone': {
    id: 'iron-bone',
    name: '强骨',
    description: '筋骨结实，挨得住，也压得住架势。',
    bonus: { maxHp: 4, maxQi: 0, maxPoise: 2, attack: 0, defense: 1 },
  },
}
