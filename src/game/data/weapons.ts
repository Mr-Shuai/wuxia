import type { WeaponDefinition } from '../types'

export const weapons: Record<string, WeaponDefinition> = {
  'old-iron-sword': {
    id: 'old-iron-sword',
    name: '旧铁剑',
    description: '藏在酒楼后厨梁下的旧剑，剑锋虽旧，仍足够应付寻常缠斗。',
    attackBonus: 1,
  },
  'black-sheath-dagger': {
    id: 'black-sheath-dagger',
    name: '乌鞘短刀',
    description: '黑船货箱里藏着的短刀，刀身窄利，适合贴身出手。',
    attackBonus: 1,
  },
  'salt-inspector-ruler': {
    id: 'salt-inspector-ruler',
    name: '巡盐铁尺',
    description: '旧巡盐房里留下的铁尺，短促沉实，适合在狭窄栈道上压招抢势。',
    attackBonus: 1,
    defenseBonus: 1,
  },
}
