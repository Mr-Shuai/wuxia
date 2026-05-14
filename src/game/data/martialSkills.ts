import type { MartialSkillDefinition } from '../types'

export const martialSkills: Record<string, MartialSkillDefinition> = {
  'swallow-step': {
    id: 'swallow-step',
    name: '燕行步',
    description: '借酒楼梁柱腾挪换位的轻身步法。',
    poiseBonus: 1,
  },
  'reed-step': {
    id: 'reed-step',
    name: '踏浪诀',
    description: '顺着芦苇与浅滩试出的水上身法。',
    attackBonus: 1,
  },
  'catwalk-step': {
    id: 'catwalk-step',
    name: '踏栈步',
    description: '在潮湿盐栈与吊脚廊桥间摸出的换位步法。',
    poiseBonus: 1,
  },
}
