# Free Exploration Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为主线前置探索加入可手动结束的自由探索地图，支持固定地图节点、银两商店、固定支线与固定武学学习。

**Architecture:** 保留现有 `story / exploration / battle` 阶段划分，不重写整套流程；在 `exploration` 阶段内新增“探索地图”层，用地图 ID、返回主线节点 ID 和已完成节点状态来维持停留。引擎上把“地图内行为”和“离开返回主线”拆成两套显式操作；UI 上将当前 `ExplorationScreen` 从动作列表页升级为“地图节点总览 + 节点详情 + 回声反馈”页。

**Tech Stack:** React 18、TypeScript、Vitest、Testing Library、CSS

---

## File Structure

### Create

- `src/game/data/explorationMaps.ts`

### Modify

- `src/game/types.ts`
- `src/game/engine/createGameState.ts`
- `src/game/engine/createGameState.test.ts`
- `src/game/engine/explorationEngine.ts`
- `src/game/engine/explorationEngine.test.ts`
- `src/components/ExplorationScreen.tsx`
- `src/components/ExplorationScreen.test.tsx`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/styles.css`

### Responsibility Notes

- `src/game/types.ts`：定义银两、地图状态、地图节点、商店与支线类型。
- `src/game/data/explorationMaps.ts`：存放三张探索地图（酒楼、渡口、盐港）的固定节点内容。
- `src/game/engine/createGameState.ts`：初始化新增状态字段。
- `src/game/engine/explorationEngine.ts`：新增进入地图、执行地图节点、结束探索返回主线三套逻辑；保留兼容旧探索动作的必要辅助函数或直接迁移调用方。
- `src/components/ExplorationScreen.tsx`：渲染地图节点总览、节点详情、购买 / 学武 / 支线 / 离开交互。
- `src/App.tsx`：把主线进入探索的逻辑改为进入地图，把 exploration phase 的提交逻辑改为“地图内停留”。
- `src/App.test.tsx` / `src/components/ExplorationScreen.test.tsx` / `src/game/engine/*.test.ts`：覆盖进入地图、地图内行为、手动返回主线的关键路径。
- `src/styles.css`：探索地图页面新增节点卡片、详情区、商店列表和状态徽标样式。

---

### Task 1: 扩展类型与初始状态（先写失败测试）

**Files:**
- Modify: `src/game/engine/createGameState.test.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/engine/createGameState.ts`

- [ ] **Step 1: 在 `src/game/engine/createGameState.test.ts` 增加失败测试，约束新增的探索地图状态字段**

```ts
it('initializes currency and exploration map state fields', () => {
  const state = createGameState({
    name: '阿青',
    originId: 'wanderer',
    talentId: 'steady-heart',
  })

  expect(state.silver).toBe(12)
  expect(state.currentExplorationMapId).toBeUndefined()
  expect(state.explorationReturnNodeId).toBeUndefined()
  expect(state.completedMapNodes).toEqual([])
  expect(state.purchasedShopItems).toEqual([])
  expect(state.completedSideQuests).toEqual([])
})
```

- [ ] **Step 2: 运行测试，确认因为字段不存在而失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/createGameState.test.ts`

Expected: FAIL，提示 `silver`、`currentExplorationMapId`、`completedMapNodes` 等字段不存在或未初始化。

- [ ] **Step 3: 在 `src/game/types.ts` 为 `GameState` 和探索地图新增最小必要类型**

```ts
export interface ShopItemDefinition {
  id: string
  name: string
  description: string
  price: number
  reward: ExplorationReward
  once?: boolean
}

export interface SideQuestDefinition {
  id: string
  title: string
  description: string
  log: string
  reward?: ExplorationReward
  effects?: ChoiceEffects
}

export interface ExplorationMapNode {
  id: string
  title: string
  description: string
  type: 'shop' | 'sidequest' | 'training' | 'intel' | 'exit'
  once?: boolean
  requires?: ChoiceRequirements
  reward?: ExplorationReward
  log?: string
  shopItems?: ShopItemDefinition[]
  quest?: SideQuestDefinition
}

export interface ExplorationMapDefinition {
  id: string
  title: string
  location: string
  summary: string
  returnNodeId: string
  nodes: ExplorationMapNode[]
}
```

并在 `GameState` 中加入：

```ts
  silver: number
  currentExplorationMapId?: string
  explorationReturnNodeId?: string
  completedMapNodes: string[]
  purchasedShopItems: string[]
  completedSideQuests: string[]
```

- [ ] **Step 4: 在 `src/game/engine/createGameState.ts` 初始化这些字段**

```ts
    silver: 12,
    inventory: [],
    martialSkills: [],
    exploredScenes: [],
    completedMapNodes: [],
    purchasedShopItems: [],
    completedSideQuests: [],
    currentExplorationMapId: undefined,
    explorationReturnNodeId: undefined,
    activeWeaponId: undefined,
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/createGameState.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交这一小步**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/game/types.ts src/game/engine/createGameState.ts src/game/engine/createGameState.test.ts
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: initialize free exploration map state"
```

---

### Task 2: 定义三张固定探索地图数据

**Files:**
- Create: `src/game/data/explorationMaps.ts`
- Modify: `src/game/engine/explorationEngine.test.ts`

- [ ] **Step 1: 在 `src/game/engine/explorationEngine.test.ts` 新增失败测试，约束地图数据存在且节点类型完整**

```ts
import { explorationMaps } from '../data/explorationMaps'

it('defines visible map nodes for inn, ferry, and wharf exploration maps', () => {
  expect(explorationMaps.X11M.nodes.map((node) => node.type)).toEqual([
    'intel',
    'training',
    'shop',
    'sidequest',
    'exit',
  ])

  expect(explorationMaps.X20M.returnNodeId).toBe('N20')
  expect(explorationMaps.X100M.nodes.some((node) => node.type === 'shop')).toBe(true)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/explorationEngine.test.ts`

Expected: FAIL，提示 `explorationMaps` 文件或 `X11M` / `X20M` / `X100M` 不存在。

- [ ] **Step 3: 创建 `src/game/data/explorationMaps.ts`，先写完整的固定地图数据**

```ts
import type { ExplorationMapDefinition } from '../types'

export const explorationMaps: Record<string, ExplorationMapDefinition> = {
  X11M: {
    id: 'X11M',
    title: '酒楼暗查图',
    location: '临江酒楼后场',
    summary: '在真正摊牌前，把酒楼里能借的线索、兵刃和步法都摸清。',
    returnNodeId: 'N11',
    nodes: [
      {
        id: 'storyteller-corner',
        title: '说书台角落',
        description: '散场后的说书台边还留着一卷客人抄下的旧账页。',
        type: 'intel',
        once: true,
        log: '你在说书台角落翻到了一页旧账，顺手记下了几条与酒楼往来有关的名字。',
        reward: { itemId: 'teahouse-ledger-page' },
      },
      {
        id: 'cross-beam-training',
        title: '横梁试步',
        description: '沿梁轻挪，试试酒楼高处能不能借力换位。',
        type: 'training',
        once: true,
        log: '你沿梁轻轻试步，把高处能借力换位的几个点全记在了心里。',
        reward: { martialSkillId: 'swallow-step' },
      },
      {
        id: 'inn-counter-shop',
        title: '掌柜小铺',
        description: '掌柜不问来历，只认银两。',
        type: 'shop',
        shopItems: [
          {
            id: 'healing-salve',
            name: '金创药',
            description: '简单止血敷创的常用药。',
            price: 4,
            reward: { itemId: 'healing-salve' },
            once: true,
          },
          {
            id: 'tinderbox',
            name: '火折子',
            description: '夜路、暗仓和旧屋都用得上。',
            price: 2,
            reward: { itemId: 'tinderbox' },
            once: true,
          },
        ],
      },
      {
        id: 'porter-errand',
        title: '脚夫求助',
        description: '一个脚夫想请你帮他讨回被讹走的货钱。',
        type: 'sidequest',
        once: true,
        quest: {
          id: 'inn-porter-errand',
          title: '脚夫讨钱',
          description: '替脚夫出面，把被讹走的几枚散碎银子讨回来。',
          log: '你替脚夫讨回了散碎银两，也换来一句“酒楼后门夜里常有生面孔出没”。',
          effects: { stats: { reputation: 1 } },
        },
      },
      {
        id: 'return-to-mainline',
        title: '收束行程',
        description: '酒楼里能摸的线索已摸得差不多了，该回去应局。',
        type: 'exit',
      },
    ],
  },
  X20M: {
    id: 'X20M',
    title: '渡口搜线图',
    location: '寒江渡口芦苇岸',
    summary: '上船前先把渡口附近的人、船、货和步法摸透。',
    returnNodeId: 'N20',
    nodes: [
      {
        id: 'reed-training',
        title: '芦苇浅滩',
        description: '顺着芦苇泥痕试步，摸清湿滑岸边的借力法门。',
        type: 'training',
        once: true,
        log: '你踩着浅滩与碎桩一遍遍试步，终于摸到了一套能在湿滑岸边借力的法门。',
        reward: { martialSkillId: 'reed-step' },
      },
      {
        id: 'black-boat-cache',
        title: '黑船货箱',
        description: '黑船边角的货箱没锁严，像是有人临时塞了东西。',
        type: 'intel',
        once: true,
        log: '你在黑船边角的木箱里摸出一柄乌鞘短刀，顺手还记下了箱板上的暗号。',
        reward: { weaponId: 'black-sheath-dagger' },
      },
      {
        id: 'ferry-stall',
        title: '渡口摊贩',
        description: '摊上卖的都是行船人常备的小物件。',
        type: 'shop',
        shopItems: [
          {
            id: 'river-ration',
            name: '压潮干粮',
            description: '顶一顿饿，也能稳住气力。',
            price: 3,
            reward: { itemId: 'river-ration' },
            once: true,
          },
          {
            id: 'throwing-pebbles',
            name: '沉手石子',
            description: '不值钱，但贴身时能先扰人一步。',
            price: 3,
            reward: { itemId: 'throwing-pebbles' },
            once: true,
          },
        ],
      },
      {
        id: 'boatman-request',
        title: '舟子委托',
        description: '一个老舟子想请你帮他把夜里偷搬的货号记下来。',
        type: 'sidequest',
        once: true,
        quest: {
          id: 'ferry-boatman-request',
          title: '记船号',
          description: '替舟子把夜里靠岸的可疑船号都看清。',
          log: '你替老舟子看清了几艘夜里靠岸的船号，对方塞给你一小袋碎银当谢礼。',
          effects: { stats: { reputation: 1 } },
          reward: { itemId: 'boatman-note' },
        },
      },
      {
        id: 'return-to-mainline',
        title: '收束行程',
        description: '渡口再逗留下去也只是打草惊蛇，该回去上船了。',
        type: 'exit',
      },
    ],
  },
  X100M: {
    id: 'X100M',
    title: '盐港封闸图',
    location: '江南盐栈高仓',
    summary: '天亮前先摸清传讯、兵刃与落脚点，再去封住盐港外闸。',
    returnNodeId: 'N110',
    nodes: [
      {
        id: 'inspector-room',
        title: '巡盐暗柜',
        description: '巡盐房里的旧柜最适合藏能压场面的短兵。',
        type: 'intel',
        once: true,
        log: '你在巡盐房暗柜里摸到一柄巡盐铁尺，又看见了被撕下半角的封条残页。',
        reward: { weaponId: 'salt-inspector-ruler' },
      },
      {
        id: 'catwalk-training',
        title: '吊脚廊桥',
        description: '沿潮湿高栈试步，把廊桥断讯的落脚点记牢。',
        type: 'training',
        once: true,
        log: '你踩着潮湿木栈反复换步，把能翻上廊桥断讯的那几处落脚点牢牢记住。',
        reward: { martialSkillId: 'catwalk-step' },
      },
      {
        id: 'smuggler-stall',
        title: '走私黑铺',
        description: '货架上的东西都更利手，也更贵。',
        type: 'shop',
        shopItems: [
          {
            id: 'wharf-smoke-pellet',
            name: '迷烟丸',
            description: '不是正道物件，但在乱局中很管用。',
            price: 6,
            reward: { itemId: 'wharf-smoke-pellet' },
            once: true,
          },
          {
            id: 'hardened-wrap',
            name: '缠腕铁布',
            description: '绑在腕上，出手时更稳。',
            price: 5,
            reward: { itemId: 'hardened-wrap' },
            once: true,
          },
        ],
      },
      {
        id: 'dockworker-clue',
        title: '脚夫口供',
        description: '脚夫们怕事，但也知道哪条栈桥最容易断讯。',
        type: 'sidequest',
        once: true,
        quest: {
          id: 'wharf-dockworker-clue',
          title: '脚夫开口',
          description: '安抚脚夫，把私盐护头的夜里换班时刻问出来。',
          log: '你稳住了几名脚夫的心神，对方低声把私盐护头换班的时刻和暗号都告诉了你。',
          reward: { itemId: 'wharf-shift-note' },
          effects: { stats: { reputation: 1 } },
        },
      },
      {
        id: 'return-to-mainline',
        title: '收束行程',
        description: '盐港再摸下去就会惊动守闸刀手，该回去封闸了。',
        type: 'exit',
      },
    ],
  },
}
```

- [ ] **Step 4: 运行测试确认地图数据可读取**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/explorationEngine.test.ts`

Expected: PASS 新增地图数据测试，旧测试可能仍会因为引擎未改而通过或失败，先关注地图数据断言已经成立。

- [ ] **Step 5: 提交这一小步**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/game/data/explorationMaps.ts src/game/engine/explorationEngine.test.ts
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: add fixed exploration map definitions"
```

---

### Task 3: 重写探索引擎，让地图内行为不再直接回主线

**Files:**
- Modify: `src/game/engine/explorationEngine.test.ts`
- Modify: `src/game/engine/explorationEngine.ts`
- Read: `src/game/data/explorationMaps.ts`

- [ ] **Step 1: 在 `src/game/engine/explorationEngine.test.ts` 新增失败测试，约束进入地图、购买、学武、完成支线、退出地图五个核心行为**

```ts
import {
  enterExplorationMap,
  applyMapNodeAction,
  leaveExplorationMap,
} from './explorationEngine'

it('enters a map without changing the story node immediately', () => {
  const state = createGameState({ name: '阿青', originId: 'escort', talentId: 'iron-bone' })
  state.currentNodeId = 'N10'

  const next = enterExplorationMap(state, 'X11M')

  expect(next.currentExplorationMapId).toBe('X11M')
  expect(next.explorationReturnNodeId).toBe('N11')
  expect(next.currentNodeId).toBe('N10')
})

it('buys a shop item, spends silver, and stays on the map', () => {
  const state = enterExplorationMap(createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' }), 'X11M')

  const next = applyMapNodeAction(state, 'X11M', 'inn-counter-shop', 'healing-salve')

  expect(next.silver).toBe(8)
  expect(next.inventory).toContain('healing-salve')
  expect(next.currentExplorationMapId).toBe('X11M')
  expect(next.currentNodeId).toBe('N00')
})

it('learns a martial skill only once from a training node', () => {
  const state = enterExplorationMap(createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' }), 'X20M')

  const first = applyMapNodeAction(state, 'X20M', 'reed-training')
  const second = applyMapNodeAction(first, 'X20M', 'reed-training')

  expect(first.martialSkills).toContain('reed-step')
  expect(second.martialSkills.filter((id) => id === 'reed-step')).toHaveLength(1)
  expect(second).toBe(first)
})

it('completes a sidequest and records it without leaving the map', () => {
  const state = enterExplorationMap(createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' }), 'X100M')

  const next = applyMapNodeAction(state, 'X100M', 'dockworker-clue')

  expect(next.completedSideQuests).toContain('wharf-dockworker-clue')
  expect(next.currentExplorationMapId).toBe('X100M')
  expect(next.chapterLogs.at(-1)).toBe('你稳住了几名脚夫的心神，对方低声把私盐护头换班的时刻和暗号都告诉了你。')
})

it('returns to the configured story node only when leaving the map', () => {
  const state = enterExplorationMap(createGameState({ name: '阿青', originId: 'escort', talentId: 'iron-bone' }), 'X100M')

  const next = leaveExplorationMap(state)

  expect(next.currentExplorationMapId).toBeUndefined()
  expect(next.explorationReturnNodeId).toBeUndefined()
  expect(next.currentNodeId).toBe('N110')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/explorationEngine.test.ts`

Expected: FAIL，提示新函数不存在，或当前行为仍然会直接回主线。

- [ ] **Step 3: 在 `src/game/engine/explorationEngine.ts` 先补辅助函数与状态复制器**

```ts
import { explorationMaps } from '../data/explorationMaps'
import type { ExplorationMapNode, GameState, ShopItemDefinition } from '../types'

function cloneExplorationState(state: GameState): GameState {
  return {
    ...state,
    inventory: [...state.inventory],
    martialSkills: [...state.martialSkills],
    exploredScenes: [...state.exploredScenes],
    visitedNodes: [...state.visitedNodes],
    completedMapNodes: [...state.completedMapNodes],
    purchasedShopItems: [...state.purchasedShopItems],
    completedSideQuests: [...state.completedSideQuests],
    flags: { ...state.flags },
    chapterLogs: [...state.chapterLogs],
  }
}

function getNodeKey(mapId: string, nodeId: string) {
  return `${mapId}:${nodeId}`
}

function getListingKey(mapId: string, nodeId: string, itemId: string) {
  return `${mapId}:${nodeId}:${itemId}`
}
```

- [ ] **Step 4: 实现进入地图、节点查找和离开地图的最小代码**

```ts
export function enterExplorationMap(state: GameState, mapId: string): GameState {
  const map = explorationMaps[mapId]
  if (!map) {
    throw new Error(`Exploration map not found: ${mapId}`)
  }

  return {
    ...state,
    currentExplorationMapId: mapId,
    explorationReturnNodeId: map.returnNodeId,
  }
}

export function leaveExplorationMap(state: GameState): GameState {
  if (!state.explorationReturnNodeId) {
    throw new Error('Exploration return node is missing')
  }

  return {
    ...state,
    currentExplorationMapId: undefined,
    explorationReturnNodeId: undefined,
    currentNodeId: state.explorationReturnNodeId,
    visitedNodes: state.visitedNodes.includes(state.explorationReturnNodeId)
      ? [...state.visitedNodes]
      : [...state.visitedNodes, state.explorationReturnNodeId],
  }
}
```

- [ ] **Step 5: 实现地图节点执行逻辑，让购买 / 学武 / 支线 / 情报都停留在地图中**

```ts
function applyReward(next: GameState, reward?: ExplorationReward) {
  if (!reward) return

  if (reward.weaponId && !next.inventory.includes(reward.weaponId)) {
    next.inventory.push(reward.weaponId)
    next.activeWeaponId = reward.weaponId
  }

  if (reward.itemId && !next.inventory.includes(reward.itemId)) {
    next.inventory.push(reward.itemId)
  }

  if (reward.martialSkillId && !next.martialSkills.includes(reward.martialSkillId)) {
    next.martialSkills.push(reward.martialSkillId)
  }
}

function applyEffects(next: GameState, effects?: ChoiceEffects) {
  if (!effects) return
  applyReward(next, effects.rewards)

  Object.entries(effects.stats ?? {}).forEach(([key, value]) => {
    const statKey = key as keyof GameState
    const current = next[statKey]
    if (typeof current === 'number' && typeof value === 'number') {
      ;(next[statKey] as number) = current + value
    }
  })

  Object.entries(effects.flags ?? {}).forEach(([key, value]) => {
    next.flags[key] = value
  })
}

export function applyMapNodeAction(
  state: GameState,
  mapId: string,
  nodeId: string,
  shopItemId?: string,
): GameState {
  const map = explorationMaps[mapId]
  if (!map) throw new Error(`Exploration map not found: ${mapId}`)

  const node = map.nodes.find((item) => item.id === nodeId)
  if (!node) throw new Error(`Exploration map node not found: ${mapId}:${nodeId}`)

  if (node.type === 'exit') {
    return leaveExplorationMap(state)
  }

  const nodeKey = getNodeKey(mapId, nodeId)
  if (node.once && state.completedMapNodes.includes(nodeKey)) {
    return state
  }

  const next = cloneExplorationState(state)

  if (!next.completedMapNodes.includes(nodeKey)) {
    next.completedMapNodes.push(nodeKey)
  }

  if (node.type === 'shop') {
    const listing = node.shopItems?.find((item) => item.id === shopItemId)
    if (!listing) {
      throw new Error(`Exploration shop item not found: ${mapId}:${nodeId}:${shopItemId}`)
    }

    const listingKey = getListingKey(mapId, nodeId, listing.id)
    if (listing.once !== false && next.purchasedShopItems.includes(listingKey)) {
      return state
    }
    if (next.silver < listing.price) {
      return state
    }

    next.silver -= listing.price
    next.purchasedShopItems.push(listingKey)
    applyReward(next, listing.reward)
    next.chapterLogs.push(`你花了 ${listing.price} 两银子，换得${listing.name}。`)
    return next
  }

  if (node.type === 'sidequest' && node.quest) {
    if (!next.completedSideQuests.includes(node.quest.id)) {
      next.completedSideQuests.push(node.quest.id)
    }
    applyReward(next, node.quest.reward)
    applyEffects(next, node.quest.effects)
    next.chapterLogs.push(node.quest.log)
    return next
  }

  applyReward(next, node.reward)
  if (node.log) {
    next.chapterLogs.push(node.log)
  }
  return next
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/explorationEngine.test.ts`

Expected: PASS。

- [ ] **Step 7: 提交这一小步**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/game/engine/explorationEngine.ts src/game/engine/explorationEngine.test.ts
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: add free exploration map engine"
```

---

### Task 4: 把 App 的探索入口和返回流程切到地图模型

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Read: `src/game/data/explorationMaps.ts`

- [ ] **Step 1: 在 `src/App.test.tsx` 新增失败测试，验证探索地图内可停留并手动返回主线**

```tsx
it('stays inside the exploration map until the player chooses to return', async () => {
  const user = userEvent.setup()

  render(<App />)

  await user.click(screen.getByRole('button', { name: '开始江湖' }))
  await user.type(screen.getByLabelText('角色名'), '阿青')
  await user.click(screen.getByRole('button', { name: '江湖浪客' }))
  await user.click(screen.getByRole('button', { name: '稳心' }))
  await user.click(screen.getByRole('button', { name: '踏入江湖' }))

  await user.click(screen.getByRole('button', { name: '收留并救治密探' }))
  await user.click(screen.getByRole('button', { name: '把残篇交回镖局' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
  })

  await user.click(screen.getByRole('button', { name: '掌柜小铺' }))
  await user.click(screen.getByRole('button', { name: '购买 金创药' }))

  expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: '酒楼听风' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '收束行程' }))
  await user.click(screen.getByRole('button', { name: '结束探索并返回主线' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: '酒楼听风' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: FAIL，当前探索流程会直接返回主线，无法停留在地图中。

- [ ] **Step 3: 在 `src/App.tsx` 顶部把探索入口映射改成地图映射，并引入新引擎方法**

```ts
import { explorationMaps } from './game/data/explorationMaps'
import { applyMapNodeAction, enterExplorationMap, leaveExplorationMap } from './game/engine/explorationEngine'

const explorationEntryByNode: Record<string, string> = {
  N11: 'X11M',
  N20: 'X20M',
  N110: 'X100M',
}

function isExplorationMapId(nodeId: string) {
  return nodeId in explorationMaps
}
```

- [ ] **Step 4: 修改继续游戏逻辑，让 exploration save 恢复为地图而不是旧 scene**

```ts
if (isExplorationMapId(restored.currentExplorationMapId ?? '')) {
  setGameState(restored)
  setPhase('exploration')
  return
}
```

并删除旧的 `isExplorationSceneId` / `hasExploredScene` 恢复分支。

- [ ] **Step 5: 修改 story -> exploration 入口，让主线选择进入地图但不改 `currentNodeId`**

```ts
const explorationMapId = explorationEntryByNode[choice.nextNodeId]

if (explorationMapId && !next.completedMapNodes.some((key) => key.startsWith(`${explorationMapId}:return-to-mainline`))) {
  setGameState(enterExplorationMap(next, explorationMapId))
  startInlineNarration('exploration', choice.effects.log)
  setPhase('exploration')
  return
}
```

- [ ] **Step 6: 修改 exploration phase 渲染，传入地图定义并使用地图内动作回调**

```ts
if (phase === 'exploration' && gameState?.currentExplorationMapId) {
  const map = explorationMaps[gameState.currentExplorationMapId]

  return renderWithQuickAccess(
    <ExplorationScreen
      state={gameState}
      map={map}
      inlineResult={explorationInlineResult}
      disableChoices={explorationInlineResult?.streaming}
      onNodeAction={(nodeId, shopItemId) => {
        if (nodeId === 'return-to-mainline') {
          const next = leaveExplorationMap(gameState)
          setGameState(next)
          startInlineNarration('story', '你把这一段暗查所得都收拢在心，转身回到了主线要紧处。')
          setPhase(isEndingNodeId(next.currentNodeId) ? 'ending' : 'story')
          return
        }

        const next = applyMapNodeAction(gameState, map.id, nodeId, shopItemId)
        setGameState(next)
        const latestLog = next.chapterLogs[next.chapterLogs.length - 1] ?? ''
        startInlineNarration('exploration', latestLog)
      }}
    />,
  )
}
```

- [ ] **Step 7: 运行 `src/App.test.tsx`，修正因新地图流程导致的断言差异，直到通过**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: PASS，尤其是新加入的“停留在地图直到手动返回”路径。

- [ ] **Step 8: 提交这一小步**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/App.tsx src/App.test.tsx
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: route story exploration through fixed maps"
```

---

### Task 5: 重做 ExplorationScreen 为地图节点总览 + 详情区

**Files:**
- Modify: `src/components/ExplorationScreen.tsx`
- Modify: `src/components/ExplorationScreen.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: 在 `src/components/ExplorationScreen.test.tsx` 新增失败测试，约束地图节点总览与详情面板交互**

```tsx
it('shows visible map nodes, node details, and a manual return action', async () => {
  const user = userEvent.setup()
  const state = createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' })
  state.silver = 12
  state.currentExplorationMapId = 'X11M'
  state.explorationReturnNodeId = 'N11'

  const calls: Array<{ nodeId: string; shopItemId?: string }> = []

  render(
    <ExplorationScreen
      state={state}
      map={explorationMaps.X11M}
      onNodeAction={(nodeId, shopItemId) => calls.push({ nodeId, shopItemId })}
    />,
  )

  expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '掌柜小铺' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '横梁试步' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '收束行程' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '掌柜小铺' }))

  expect(screen.getByText('金创药')).toBeInTheDocument()
  expect(screen.getByText('4 两')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '购买 金创药' }))
  expect(calls).toEqual([{ nodeId: 'inn-counter-shop', shopItemId: 'healing-salve' }])

  await user.click(screen.getByRole('button', { name: '收束行程' }))
  expect(screen.getByRole('button', { name: '结束探索并返回主线' })).toBeInTheDocument()
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/components/ExplorationScreen.test.tsx`

Expected: FAIL，当前组件只接受 `scene` 和 `onChoose(action)`，没有地图节点或详情区。

- [ ] **Step 3: 重写 `src/components/ExplorationScreen.tsx` 的 props 与基础状态，先支持节点选择**

```tsx
import { useMemo, useState } from 'react'
import ResultScreen from './ResultScreen'
import StatusPanel from './StatusPanel'
import type { ExplorationMapDefinition, ExplorationMapNode, GameState } from '../game/types'

interface ExplorationScreenProps {
  state: GameState
  map: ExplorationMapDefinition
  onNodeAction: (nodeId: string, shopItemId?: string) => void
  inlineResult?: InlineResultState | null
  disableChoices?: boolean
}

export default function ExplorationScreen({
  state,
  map,
  onNodeAction,
  inlineResult = null,
  disableChoices = false,
}: ExplorationScreenProps) {
  const [selectedNodeId, setSelectedNodeId] = useState(map.nodes[0]?.id ?? '')

  const selectedNode = useMemo(
    () => map.nodes.find((node) => node.id === selectedNodeId) ?? map.nodes[0],
    [map.nodes, selectedNodeId],
  )
```

- [ ] **Step 4: 实现地图节点总览区和详情区的最小 JSX**

```tsx
  return (
    <main className="screen shell two-column exploration-layout exploration-map-layout">
      <section className="panel story-panel">
        <header className="story-header exploration-hero">
          <div className="exploration-hero-copy">
            <p className="eyebrow">探索地图 · {map.id}</p>
            <h1>{map.title}</h1>
            <p className="location">{map.location}</p>
            <p className="muted exploration-hero-lead">{map.summary}</p>
          </div>
          <div className="exploration-hero-status">
            <span className="exploration-phase-badge exploration-phase-open">自由探索中</span>
            <p>银两：{state.silver} 两</p>
            <p>已了结 {state.completedMapNodes.filter((key) => key.startsWith(`${map.id}:`)).length} / {map.nodes.length} 处</p>
          </div>
        </header>

        <section className="exploration-map-grid">
          <div className="exploration-map-nodes">
            {map.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={selectedNodeId === node.id ? 'exploration-map-node active' : 'exploration-map-node'}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <span className="exploration-map-node-type">{node.type}</span>
                <strong>{node.title}</strong>
                <span>{node.description}</span>
              </button>
            ))}
          </div>

          <section className="exploration-node-detail">
            <p className="eyebrow">节点详情</p>
            <h2>{selectedNode?.title}</h2>
            <p>{selectedNode?.description}</p>
          </section>
        </section>

        {inlineResult ? (
          <ResultScreen eyebrow="探索所得" title="" text={inlineResult.text} streaming={inlineResult.streaming} className="story-echo-panel story-echo-panel-narrow" />
        ) : null}
      </section>
      <StatusPanel state={state} compact />
    </main>
  )
}
```

- [ ] **Step 5: 按节点类型填充详情区交互按钮**

```tsx
function renderNodeActions(node: ExplorationMapNode) {
  if (node.type === 'shop') {
    return (
      <div className="exploration-shop-list">
        {node.shopItems?.map((item) => (
          <div key={item.id} className="exploration-shop-item">
            <div>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
            </div>
            <div className="exploration-shop-meta">
              <span>{item.price} 两</span>
              <button
                type="button"
                onClick={() => onNodeAction(node.id, item.id)}
                disabled={disableChoices || state.silver < item.price}
                aria-label={`购买 ${item.name}`}
              >
                购买 {item.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (node.type === 'exit') {
    return (
      <button type="button" onClick={() => onNodeAction(node.id)} disabled={disableChoices} aria-label="结束探索并返回主线">
        结束探索并返回主线
      </button>
    )
  }

  return (
    <button type="button" onClick={() => onNodeAction(node.id)} disabled={disableChoices}>
      {node.type === 'training' ? '试步习得' : node.type === 'sidequest' ? '了结此事' : '搜查此处'}
    </button>
  )
}
```

在详情区尾部插入：

```tsx
{selectedNode ? renderNodeActions(selectedNode) : null}
```

- [ ] **Step 6: 在 `src/styles.css` 增加探索地图布局样式**

```css
.exploration-map-layout .story-panel {
  display: grid;
  gap: 0.85rem;
}

.exploration-map-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 0.85rem;
}

.exploration-map-nodes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.exploration-map-node,
.exploration-node-detail,
.exploration-shop-item {
  border: 1px solid rgba(201, 164, 92, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.exploration-map-node {
  display: grid;
  gap: 0.35rem;
  padding: 0.8rem 0.9rem;
  text-align: left;
}

.exploration-map-node.active {
  border-color: rgba(210, 171, 84, 0.62);
  background: rgba(210, 171, 84, 0.12);
}

.exploration-node-detail {
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem 1rem;
}

.exploration-shop-list {
  display: grid;
  gap: 0.6rem;
}

.exploration-shop-item {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem 0.8rem;
}
```

- [ ] **Step 7: 运行组件测试直到通过**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/components/ExplorationScreen.test.tsx`

Expected: PASS。

- [ ] **Step 8: 提交这一小步**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/components/ExplorationScreen.tsx src/components/ExplorationScreen.test.tsx src/styles.css
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: redesign exploration screen for map nodes"
```

---

### Task 6: 打通全量验证并清理兼容逻辑

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/game/engine/explorationEngine.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: 删除或收敛旧 `ExplorationScene` 直返主线分支，只保留必要兼容路径**

```ts
// 删除 App.tsx 中基于 explorationScenes.currentNodeId 的 direct-return 渲染
// 统一以 gameState.currentExplorationMapId 判定 exploration 页面

if (phase === 'exploration' && gameState?.currentExplorationMapId) {
  // 新地图渲染逻辑
}
```

如果 `applyExplorationAction()` 已不再被调用，就在 `src/game/engine/explorationEngine.ts` 中移除它，或保留为兼容包装但不再被 `App.tsx` 使用。

- [ ] **Step 2: 跑 Exploration 相关测试、App 测试和构建**

Run:

```bash
npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/game/engine/explorationEngine.test.ts
npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/components/ExplorationScreen.test.tsx
npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx
npm run build --prefix "/Users/bytedance/git_hub/wuxia"
```

Expected:

- explorationEngine tests PASS
- ExplorationScreen tests PASS
- App tests PASS
- build PASS

- [ ] **Step 3: 运行全量测试，确认没有回归**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia"`

Expected: 全量 PASS。

- [ ] **Step 4: 做一轮代码自检，重点核对这三点**

检查项：

- 地图内行为是否还有任何隐式回主线路径
- 银两不足购买时是否稳定返回原状态
- 已购 / 已习得 / 已完成状态是否与 UI 渲染一致

- [ ] **Step 5: 提交收尾改动**

```bash
git -C "/Users/bytedance/git_hub/wuxia" add src/App.tsx src/game/engine/explorationEngine.ts src/styles.css src/components/ExplorationScreen.tsx src/components/ExplorationScreen.test.tsx src/App.test.tsx
git -C "/Users/bytedance/git_hub/wuxia" commit -m "feat: ship first pass of free exploration maps"
```

---

## Self-Review

### Spec coverage

- 轻量挂接型地图：Task 3、Task 4
- 地图节点全部可见：Task 5
- 不设行动点限制：Task 3、Task 5（无行动点字段）
- 固定内容商店 / 支线 / 武学：Task 2、Task 3
- 玩家手动结束探索回主线：Task 3、Task 4、Task 5
- 三张首版地图：Task 2
- 测试与回归验证：Task 1、Task 3、Task 4、Task 5、Task 6

### Placeholder scan

- 没有使用 TBD / TODO / “稍后实现” 占位词。
- 每个代码步骤都给出了实际代码片段或明确命令。

### Type consistency

- `currentExplorationMapId` / `explorationReturnNodeId` / `completedMapNodes` 在类型、初始化、引擎和 UI 中使用一致。
- 地图类型统一使用 `ExplorationMapDefinition` / `ExplorationMapNode` / `ShopItemDefinition` / `SideQuestDefinition`。
- 交互回调统一使用 `onNodeAction(nodeId, shopItemId?)`。

