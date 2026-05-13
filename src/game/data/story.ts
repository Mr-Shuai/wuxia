import type { StoryNode } from '../types'

export const storyNodes: Record<string, StoryNode> = {
  N00: {
    id: 'N00',
    title: '破庙夜雨',
    location: '郊野破庙',
    content: [
      '夜雨敲破了瓦缝，一名身负刀伤的密探倒在残灯下，袖中还攥着一角血湿的纸页。',
      '他气若游丝，只来得及低声求一句：莫让东西落进黑市之手。',
    ],
    choices: [
      {
        id: 'rescue-spy',
        text: '收留并救治密探',
        nextNodeId: 'N10',
        effects: {
          log: '你冒雨生火，为密探止了血，也欠下了一段人情。',
          stats: { debt: 1, morality: 1, reputation: 1 },
          flags: { savedSpy: true },
        },
      },
      {
        id: 'leave-spy',
        text: '谨慎离去，不惹祸上身',
        nextNodeId: 'N10',
        effects: {
          log: '你转身离去，雨声掩住了那人的呼吸，也让麻烦在暗处生根。',
          stats: { wantedLevel: 1 },
          flags: { savedSpy: false },
        },
      },
    ],
  },
  N10: {
    id: 'N10',
    title: '镖银失踪案',
    location: '古道驿站',
    content: [
      '第二日清晨，镖局的人在驿站找上了你。昨夜失踪的并非银两，而是一份残篇抄本。',
      '你意识到，自己手里的线索正是各方争夺的真正目标。',
    ],
    choices: [
      {
        id: 'return-scroll',
        text: '把残篇交回镖局',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇交还，换来一份信任，也让自己站到了更亮的地方。',
          stats: { morality: 1, favorSword: 1, reputation: 1 },
          flags: { keptScroll: false, soldScroll: false },
        },
      },
      {
        id: 'keep-scroll',
        text: '将残篇暂且私藏',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇贴身藏起，消息却已悄然泄露。',
          stats: { wantedLevel: 1, favorBlackMarket: 1 },
          flags: { keptScroll: true },
        },
      },
      {
        id: 'sell-scroll',
        text: '卖给黑市换情报',
        nextNodeId: 'N11',
        effects: {
          log: '你把残篇交给黑市掮客，换来一条更深的暗线。',
          stats: { morality: -1, debt: 1, favorBlackMarket: 2 },
          flags: { soldScroll: true },
        },
      },
    ],
  },
  N11: {
    id: 'N11',
    title: '酒楼听风',
    location: '临江酒楼',
    content: [
      '酒楼二层，名门与帮会隔桌相望，一本账册和几句风声足以让人拔刀。',
      '你可以当众比武、潜身取证，或者坐下来用人情和口舌换一条出路。',
    ],
    choices: [
      {
        id: 'public-duel',
        text: '当众比武定是非',
        nextNodeId: 'N12',
        battleId: 'inn-duel',
        effects: {
          log: '你拔刀踏前，选择用最堂皇的方式让众人闭嘴。',
          stats: { morality: 1, reputation: 1, favorSword: 1 },
          flags: { wonInnDuel: false },
        },
      },
      {
        id: 'steal-ledger',
        text: '潜入后厨偷取账册',
        nextNodeId: 'N12',
        battleId: 'guard-skirmish',
        effects: {
          log: '你借着酒气与人影潜入暗处，但脚步终究惊动了护卫。',
          stats: { wantedLevel: 1, favorBlackMarket: 1 },
        },
      },
      {
        id: 'trade-info',
        text: '谈判交换情报',
        nextNodeId: 'N12',
        effects: {
          log: '你没有拔刀，而是让一句句真假参半的话替你开路。',
          stats: { debt: 1, reputation: 1 },
        },
      },
    ],
  },
  N12: {
    id: 'N12',
    title: '山门试剑',
    location: '山门石阶',
    content: [
      '酒楼一事过后，各方都想知道你究竟要把自己交给谁。山门前的风，比夜雨更冷。',
      '你可以入宗门、投暗线，也可以继续做一个不受约束的浪客。',
    ],
    choices: [
      {
        id: 'join-sword-sect',
        text: '入清正剑宗，换一条正路',
        nextNodeId: 'E01',
        effects: {
          log: '你在石阶前收刀行礼，决定把自己的名字写进正道门墙。',
          stats: { morality: 1, favorSword: 2, reputation: 1 },
        },
      },
      {
        id: 'join-black-market',
        text: '借黑市庇护，先活下来再说',
        nextNodeId: 'E02',
        effects: {
          log: '你没有再看山门，而是顺着暗巷走向那群等价交换的人。',
          stats: { wantedLevel: 1, favorBlackMarket: 2, debt: 1 },
        },
      },
      {
        id: 'protect-secret-line',
        text: '替密探守住暗线，不入任何门下',
        nextNodeId: 'E04',
        effects: {
          log: '你把名字留在风里，却把证据和人情都押给了那条看不见的暗线。',
          stats: { reputation: 1, debt: 1 },
          flags: { savedSpy: true },
        },
      },
      {
        id: 'stay-wanderer',
        text: '仍做江湖浪客，把路留给自己',
        nextNodeId: 'E03',
        effects: {
          log: '你谢绝了所有招揽，决定把刀和脚步都留给更远的地方。',
          stats: { reputation: 1 },
        },
      },
    ],
  },
}
