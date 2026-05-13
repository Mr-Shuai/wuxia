import type { EndingDefinition } from '../types'

export const endings: EndingDefinition[] = [
  {
    id: 'E01',
    title: '正道倾向',
    summary: '你选择把自己放在灯火最亮的地方，让江湖先记住了你的名号。',
    tone: '正道新秀',
    condition: (state) => state.morality >= 2 && state.reputation >= 2,
  },
  {
    id: 'E02',
    title: '黑市倾向',
    summary: '你从刀锋旁侧身而过，换来的是暗处的人脉和更深的债。',
    tone: '灰色行者',
    condition: (state) => state.favorBlackMarket >= 2 || state.wantedLevel >= 2,
  },
  {
    id: 'E04',
    title: '暗线执棋',
    summary: '你没有入任何门墙，却把证据、人情和余地都握在手里，成了江湖与朝堂之间最难察觉的一枚棋子。',
    tone: '暗线执灯人',
    condition: (state) => state.flags.savedSpy === true && state.debt >= 2,
  },
  {
    id: 'E03',
    title: '中立悬念',
    summary: '你还没真正站队，但这片江湖已经开始记住你的名字。',
    tone: '游离浪客',
    condition: () => true,
  },
]
