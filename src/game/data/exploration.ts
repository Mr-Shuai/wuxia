import type { ExplorationScene } from '../types'

export const explorationScenes: Record<string, ExplorationScene> = {
  X11: {
    id: 'X11',
    title: '酒楼暗查',
    location: '临江酒楼后场',
    description: ['在真正摊牌前，你还有片刻可以先探酒楼暗处。'],
    actions: [
      {
        id: 'search-kitchen-cache',
        text: '摸进后厨暗格，看看有没有人藏兵器',
        log: '你在灶台后的暗格里摸到一柄旧铁剑，剑虽旧，却正合手。',
        once: true,
        nextNodeId: 'N11',
        rewards: { weaponId: 'old-iron-sword' },
      },
      {
        id: 'cross-beam-footwork',
        text: '沿梁试步，记下高处换位的落点',
        log: '你沿着酒楼横梁轻轻试步，把可借力的踏点全记在了心里。',
        once: true,
        nextNodeId: 'N11',
        rewards: { martialSkillId: 'swallow-step' },
      },
    ],
  },
  X20: {
    id: 'X20',
    title: '渡口搜线',
    location: '寒江渡口芦苇岸',
    description: ['真正上船前，你可以先在渡口附近摸一轮暗线。'],
    actions: [
      {
        id: 'trace-reeds-footwork',
        text: '顺着芦苇泥痕试步，摸清浅滩借力的法子',
        log: '你踩着浅滩与碎桩一遍遍试步，终于摸到了一套能在湿滑岸边借力的法门。',
        once: true,
        nextNodeId: 'N20',
        rewards: { martialSkillId: 'reed-step' },
      },
      {
        id: 'check-black-boat-crate',
        text: '翻查黑船边角货箱，看看有没有顺手兵刃',
        log: '你在黑船边角的木箱里摸出一柄乌鞘短刀，正适合贴身出手。',
        once: true,
        nextNodeId: 'N20',
        rewards: { weaponId: 'black-sheath-dagger' },
      },
    ],
  },
  X100: {
    id: 'X100',
    title: '南仓摸册',
    location: '江南盐栈高仓',
    description: ['夜色压在盐栈屋脊上，你得先摸清传讯与册页藏处，才有资格在天亮前封住整座盐港。'],
    actions: [
      {
        id: 'search-inspector-room',
        text: '潜进巡盐房翻旧柜，找能压住场面的短兵与封条残页',
        log: '你在巡盐房暗柜里摸到一柄巡盐铁尺，又找到了被撕下半角的封条残页。',
        once: true,
        nextNodeId: 'N110',
        rewards: { weaponId: 'salt-inspector-ruler' },
      },
      {
        id: 'catwalk-footwork',
        text: '沿潮湿高栈试步，记牢跨桥换位的落脚点',
        log: '你踩着潮湿木栈反复换步，把能翻上廊桥断讯的那几处落脚点牢牢记住。',
        once: true,
        nextNodeId: 'N110',
        rewards: { martialSkillId: 'catwalk-step' },
      },
    ],
  },
}
