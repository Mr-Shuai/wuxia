# Wuxia Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个浏览器可玩的武侠剧情 RPG MVP，完成“开始页 → 角色创建 → N00 → N10 → N11 → 战斗/结局 → 本地存档”的完整闭环。

**Architecture:** 采用 React + TypeScript + Vite 的单页应用结构，用 `GameState` 管理全局状态，用配置驱动 `StoryNode` / `BattleDefinition` / `EndingDefinition`，以纯前端 localStorage 实现自动存档。核心逻辑优先抽成纯函数并先写测试，UI 只负责展示当前阶段和分发动作。

**Tech Stack:** React 18、TypeScript、Vite、Vitest、Testing Library、CSS

---

## File Structure

### Create

- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`
- `src/game/types.ts`
- `src/game/constants.ts`
- `src/game/data/origins.ts`
- `src/game/data/talents.ts`
- `src/game/data/story.ts`
- `src/game/data/battles.ts`
- `src/game/data/endings.ts`
- `src/game/engine/createGameState.ts`
- `src/game/engine/storyEngine.ts`
- `src/game/engine/battleEngine.ts`
- `src/game/engine/storage.ts`
- `src/components/StartScreen.tsx`
- `src/components/CharacterCreateScreen.tsx`
- `src/components/StoryScreen.tsx`
- `src/components/BattleScreen.tsx`
- `src/components/ResultScreen.tsx`
- `src/components/EndingScreen.tsx`
- `src/components/StatusPanel.tsx`
- `src/components/ChoiceList.tsx`
- `src/test/setup.ts`
- `src/game/engine/createGameState.test.ts`
- `src/game/engine/storyEngine.test.ts`
- `src/game/engine/battleEngine.test.ts`
- `src/App.test.tsx`

### Responsibility Notes

- `src/game/types.ts`：统一定义游戏状态、剧情节点、选项、战斗和结局类型。
- `src/game/data/*`：纯配置内容，避免把剧情写进组件。
- `src/game/engine/*`：纯逻辑与副作用边界（状态生成、剧情推进、战斗计算、存档读写）。
- `src/components/*`：按游戏阶段拆分页面组件，避免单文件过大。
- `src/App.tsx`：应用壳，负责阶段切换、调度 engine、连接 UI。

---

### Task 1: 搭建 React + Vite + Vitest 基础工程

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`

- [ ] **Step 1: 写入基础依赖与脚本**

```json
{
  "name": "wuxia",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: 写入 TypeScript 与 Vite 配置**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 写入入口文件与测试初始化**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: 安装依赖并跑空测试**

Run: `npm install`

Run: `npm test`

Expected: Vitest 启动成功，即使暂时显示无测试文件。

---

### Task 2: 用测试先定义游戏核心类型与初始状态

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/constants.ts`
- Create: `src/game/data/origins.ts`
- Create: `src/game/data/talents.ts`
- Create: `src/game/engine/createGameState.ts`
- Test: `src/game/engine/createGameState.test.ts`

- [ ] **Step 1: 先写失败测试，定义角色创建结果**

```ts
import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'

describe('createGameState', () => {
  it('creates a new game from origin and talent bonuses', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    expect(state.name).toBe('阿青')
    expect(state.origin).toBe('wanderer')
    expect(state.talent).toBe('steady-heart')
    expect(state.currentNodeId).toBe('N00')
    expect(state.maxHp).toBeGreaterThan(0)
    expect(state.maxQi).toBeGreaterThan(0)
    expect(state.flags.savedSpy).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/game/engine/createGameState.test.ts`

Expected: FAIL，提示 `createGameState` 或相关文件不存在。

- [ ] **Step 3: 补齐类型、配置与最小实现**

```ts
// src/game/types.ts
export type GamePhase = 'start' | 'create' | 'story' | 'battle' | 'result' | 'ending'

export type OriginId = 'scholar' | 'wanderer' | 'escort'
export type TalentId = 'steady-heart' | 'keen-eye' | 'iron-bone'

export interface GameState {
  name: string
  origin: OriginId
  talent: TalentId
  maxHp: number
  hp: number
  maxQi: number
  qi: number
  maxPoise: number
  poise: number
  attack: number
  defense: number
  morality: number
  wantedLevel: number
  reputation: number
  debt: number
  favorSword: number
  favorBlackMarket: number
  currentNodeId: string
  visitedNodes: string[]
  flags: Record<string, boolean>
  chapterLogs: string[]
}
```

```ts
// src/game/engine/createGameState.ts
import type { GameState, OriginId, TalentId } from '../types'
import { origins } from '../data/origins'
import { talents } from '../data/talents'

export function createGameState(input: { name: string; originId: OriginId; talentId: TalentId }): GameState {
  const origin = origins[input.originId]
  const talent = talents[input.talentId]

  const maxHp = origin.base.maxHp + talent.bonus.maxHp
  const maxQi = origin.base.maxQi + talent.bonus.maxQi
  const maxPoise = origin.base.maxPoise + talent.bonus.maxPoise

  return {
    name: input.name,
    origin: input.originId,
    talent: input.talentId,
    maxHp,
    hp: maxHp,
    maxQi,
    qi: maxQi,
    maxPoise,
    poise: maxPoise,
    attack: origin.base.attack + talent.bonus.attack,
    defense: origin.base.defense + talent.bonus.defense,
    morality: 0,
    wantedLevel: 0,
    reputation: 0,
    debt: 0,
    favorSword: 0,
    favorBlackMarket: 0,
    currentNodeId: 'N00',
    visitedNodes: ['N00'],
    flags: {
      savedSpy: false,
      keptScroll: false,
      soldScroll: false,
      wonInnDuel: false,
    },
    chapterLogs: ['你踏入了风雨欲来的江湖。'],
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test -- src/game/engine/createGameState.test.ts`

Expected: PASS。

---

### Task 3: 用测试定义剧情节点推进与结局判定

**Files:**
- Create: `src/game/data/story.ts`
- Create: `src/game/data/endings.ts`
- Create: `src/game/engine/storyEngine.ts`
- Test: `src/game/engine/storyEngine.test.ts`

- [ ] **Step 1: 先写失败测试，覆盖选项效果与跳转**

```ts
import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { applyChoice, resolveEnding } from './storyEngine'

describe('storyEngine', () => {
  it('applies N00 rescue choice and advances to N10', () => {
    const state = createGameState({ name: '阿青', originId: 'scholar', talentId: 'keen-eye' })
    const next = applyChoice(state, 'N00', 'rescue-spy')

    expect(next.currentNodeId).toBe('N10')
    expect(next.flags.savedSpy).toBe(true)
    expect(next.debt).toBe(1)
  })

  it('resolves righteous ending when morality is high', () => {
    const state = createGameState({ name: '阿青', originId: 'escort', talentId: 'iron-bone' })
    state.morality = 2
    state.reputation = 2
    expect(resolveEnding(state).id).toBe('E01')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/game/engine/storyEngine.test.ts`

Expected: FAIL，提示 `applyChoice` / `resolveEnding` 未定义。

- [ ] **Step 3: 实现剧情配置与纯函数推进**

```ts
// src/game/engine/storyEngine.ts
import { endings } from '../data/endings'
import { storyNodes } from '../data/story'
import type { GameState } from '../types'

export function applyChoice(state: GameState, nodeId: string, choiceId: string): GameState {
  const node = storyNodes[nodeId]
  const choice = node.choices.find((item) => item.id === choiceId)

  if (!choice) {
    throw new Error(`Choice not found: ${nodeId}:${choiceId}`)
  }

  const next = structuredClone(state) as GameState

  for (const [key, value] of Object.entries(choice.effects.stats ?? {})) {
    ;(next as Record<string, number>)[key] += value
  }

  for (const [flag, value] of Object.entries(choice.effects.flags ?? {})) {
    next.flags[flag] = value
  }

  next.chapterLogs.push(choice.effects.log)
  next.currentNodeId = choice.nextNodeId
  next.visitedNodes.push(choice.nextNodeId)

  return next
}

export function resolveEnding(state: GameState) {
  return endings.find((ending) => ending.condition(state)) ?? endings[endings.length - 1]
}
```

- [ ] **Step 4: 运行剧情测试**

Run: `npm test -- src/game/engine/storyEngine.test.ts`

Expected: PASS。

---

### Task 4: 用测试定义战斗回合规则与胜负回写

**Files:**
- Create: `src/game/data/battles.ts`
- Create: `src/game/engine/battleEngine.ts`
- Test: `src/game/engine/battleEngine.test.ts`

- [ ] **Step 1: 先写失败测试，覆盖攻击与破招逻辑**

```ts
import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { createBattleState, runBattleTurn } from './battleEngine'

describe('battleEngine', () => {
  it('reduces enemy poise and hp on attack', () => {
    const player = createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' })
    const battle = createBattleState(player, 'bandit-ambush')
    const next = runBattleTurn(battle, 'attack')

    expect(next.enemy.hp).toBeLessThan(battle.enemy.hp)
    expect(next.enemy.poise).toBeLessThan(battle.enemy.poise)
  })

  it('spends qi on break action', () => {
    const player = createGameState({ name: '阿青', originId: 'wanderer', talentId: 'steady-heart' })
    const battle = createBattleState(player, 'bandit-ambush')
    battle.enemy.poise = 0

    const next = runBattleTurn(battle, 'break')
    expect(next.player.qi).toBeLessThan(battle.player.qi)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/game/engine/battleEngine.test.ts`

Expected: FAIL，提示战斗 engine 不存在。

- [ ] **Step 3: 实现最小战斗状态与回合结算**

```ts
// src/game/engine/battleEngine.ts
import { battles } from '../data/battles'
import type { GameState } from '../types'

export type PlayerAction = 'attack' | 'focus' | 'guard' | 'break'

export interface BattleState {
  player: Pick<GameState, 'hp' | 'qi' | 'poise' | 'attack' | 'defense' | 'maxHp' | 'maxQi' | 'maxPoise'>
  enemy: { id: string; name: string; hp: number; qi: number; poise: number; attack: number; defense: number }
  log: string[]
  outcome: 'ongoing' | 'victory' | 'defeat'
}

export function createBattleState(player: GameState, battleId: string): BattleState {
  const definition = battles[battleId]
  return {
    player: {
      hp: player.hp,
      qi: player.qi,
      poise: player.poise,
      attack: player.attack,
      defense: player.defense,
      maxHp: player.maxHp,
      maxQi: player.maxQi,
      maxPoise: player.maxPoise,
    },
    enemy: { ...definition.enemy },
    log: [`${definition.enemy.name} 挡在了你的去路。`],
    outcome: 'ongoing',
  }
}

export function runBattleTurn(state: BattleState, action: PlayerAction): BattleState {
  const next = structuredClone(state) as BattleState

  if (action === 'attack') {
    next.enemy.hp -= Math.max(4, next.player.attack - next.enemy.defense)
    next.enemy.poise = Math.max(0, next.enemy.poise - 3)
    next.log.push('你沉步进击，逼退了对手。')
  }

  if (action === 'focus') {
    next.player.qi = Math.min(next.player.maxQi, next.player.qi + 3)
    next.player.poise = Math.min(next.player.maxPoise, next.player.poise + 2)
    next.log.push('你调匀气息，稳住了架势。')
  }

  if (action === 'guard') {
    next.player.poise = Math.min(next.player.maxPoise, next.player.poise + 1)
    next.log.push('你收势守门，静待来招。')
  }

  if (action === 'break') {
    next.player.qi = Math.max(0, next.player.qi - 2)
    const damage = next.enemy.poise === 0 ? 10 : 5
    next.enemy.hp -= damage
    next.log.push('你抓住破绽，一招破招直取中门。')
  }

  if (next.enemy.hp <= 0) {
    next.outcome = 'victory'
    return next
  }

  const enemyDamage = Math.max(2, next.enemy.attack - next.player.defense)
  next.player.hp -= enemyDamage
  next.player.poise = Math.max(0, next.player.poise - 2)
  next.log.push(`${next.enemy.name} 反手逼近，给你造成 ${enemyDamage} 点伤害。`)

  if (next.player.hp <= 0) {
    next.outcome = 'defeat'
  }

  return next
}
```

- [ ] **Step 4: 运行战斗测试**

Run: `npm test -- src/game/engine/battleEngine.test.ts`

Expected: PASS。

---

### Task 5: 先写 UI 测试，再实现开始页、创建页、剧情页、战斗页、结算页和结局页

**Files:**
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/components/StartScreen.tsx`
- Create: `src/components/CharacterCreateScreen.tsx`
- Create: `src/components/StoryScreen.tsx`
- Create: `src/components/BattleScreen.tsx`
- Create: `src/components/ResultScreen.tsx`
- Create: `src/components/EndingScreen.tsx`
- Create: `src/components/StatusPanel.tsx`
- Create: `src/components/ChoiceList.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: 先写失败测试，验证主流程可玩**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

it('plays through start to first story node', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: '开始江湖' }))
  await user.type(screen.getByLabelText('角色名'), '阿青')
  await user.click(screen.getByRole('button', { name: '江湖浪客' }))
  await user.click(screen.getByRole('button', { name: '稳心' }))
  await user.click(screen.getByRole('button', { name: '踏入江湖' }))

  expect(screen.getByText(/N00/)).toBeInTheDocument()
  expect(screen.getByText(/破庙夜雨/)).toBeInTheDocument()
})
```

- [ ] **Step 2: 运行 UI 测试确认失败**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL，提示 `App` 或相关组件不存在。

- [ ] **Step 3: 实现主应用壳与分屏组件**

```tsx
// src/App.tsx
import { useMemo, useState } from 'react'
import { createGameState } from './game/engine/createGameState'
import { applyChoice, resolveEnding } from './game/engine/storyEngine'
import { createBattleState, runBattleTurn } from './game/engine/battleEngine'
import StartScreen from './components/StartScreen'
import CharacterCreateScreen from './components/CharacterCreateScreen'
import StoryScreen from './components/StoryScreen'
import BattleScreen from './components/BattleScreen'
import ResultScreen from './components/ResultScreen'
import EndingScreen from './components/EndingScreen'

export default function App() {
  const [phase, setPhase] = useState<'start' | 'create' | 'story' | 'battle' | 'result' | 'ending'>('start')
  const [gameState, setGameState] = useState<any>(null)
  const [battleState, setBattleState] = useState<any>(null)
  const [resultText, setResultText] = useState<string>('')

  const ending = useMemo(() => (gameState ? resolveEnding(gameState) : null), [gameState])

  if (phase === 'start') return <StartScreen onStart={() => setPhase('create')} />
  if (phase === 'create') {
    return <CharacterCreateScreen onSubmit={(payload) => {
      setGameState(createGameState(payload))
      setPhase('story')
    }} />
  }
  if (phase === 'story' && gameState) {
    return <StoryScreen state={gameState} onChoose={(choice) => {
      const next = applyChoice(gameState, gameState.currentNodeId, choice.id)
      setGameState(next)
      if (choice.battleId) {
        setBattleState(createBattleState(next, choice.battleId))
        setPhase('battle')
      } else if (choice.nextNodeId.startsWith('E')) {
        setResultText(choice.effects.log)
        setPhase('ending')
      } else {
        setResultText(choice.effects.log)
        setPhase('result')
      }
    }} />
  }
  if (phase === 'battle' && battleState && gameState) {
    return <BattleScreen battle={battleState} onAction={(action) => {
      const nextBattle = runBattleTurn(battleState, action)
      setBattleState(nextBattle)
      if (nextBattle.outcome !== 'ongoing') {
        setResultText(nextBattle.outcome === 'victory' ? '你赢下了这场较量。' : '你负伤脱身，代价已留在身上。')
        setPhase('result')
      }
    }} />
  }
  if (phase === 'result' && gameState) {
    return <ResultScreen state={gameState} text={resultText} onContinue={() => {
      if (gameState.currentNodeId === 'N11') {
        setPhase('ending')
      } else {
        setPhase('story')
      }
    }} />
  }
  if (phase === 'ending' && gameState && ending) {
    return <EndingScreen ending={ending} state={gameState} onRestart={() => {
      setGameState(null)
      setBattleState(null)
      setResultText('')
      setPhase('start')
    }} />
  }

  return null
}
```

- [ ] **Step 4: 运行 UI 测试并补齐交互文案差异**

Run: `npm test -- src/App.test.tsx`

Expected: PASS，至少能从开始页进入 `N00`。

---

### Task 6: 接入 localStorage 持久化，并补上刷新恢复与重开测试

**Files:**
- Create: `src/game/engine/storage.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: 先写失败测试，验证自动存档与重开**

```tsx
it('saves progress and can restart cleanly', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: '开始江湖' }))
  await user.type(screen.getByLabelText('角色名'), '阿青')
  await user.click(screen.getByRole('button', { name: '江湖浪客' }))
  await user.click(screen.getByRole('button', { name: '稳心' }))
  await user.click(screen.getByRole('button', { name: '踏入江湖' }))

  expect(window.localStorage.getItem('wuxia-save')).toContain('N00')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test -- src/App.test.tsx -t "saves progress"`

Expected: FAIL，当前没有持久化实现。

- [ ] **Step 3: 实现存档读写与应用初始化恢复**

```ts
// src/game/engine/storage.ts
const STORAGE_KEY = 'wuxia-save'

export function saveGame(value: unknown) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function loadGame<T>() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as T) : null
}

export function clearGame() {
  window.localStorage.removeItem(STORAGE_KEY)
}
```

- [ ] **Step 4: 运行全量测试并验证构建**

Run: `npm test`

Expected: PASS。

Run: `npm run build`

Expected: Vite 构建成功，输出 `dist/`。

---

### Task 7: 手动验收玩法闭环并做收尾清理

**Files:**
- Modify: `src/styles.css`
- Modify: `src/game/data/story.ts`
- Modify: `src/game/data/battles.ts`
- Modify: `src/components/*`

- [ ] **Step 1: 本地运行试玩链路 1（纯剧情）**

Run: `npm run dev`

Manual path:

1. 开始江湖
2. 创建角色
3. 在 `N00` 选择救密探
4. 在 `N10` 选择交还残篇
5. 在 `N11` 选择谈判交换情报
6. 验证进入 `E01` 或 `E03`

Expected: 全链路可达，无空白页。

- [ ] **Step 2: 本地运行试玩链路 2（触发战斗）**

Manual path:

1. 开始江湖
2. 任意角色创建
3. 在 `N11` 选择当众比武或潜入失败路径
4. 在战斗中依次尝试 `攻击` / `运气` / `防守` / `破招`

Expected: 战斗日志持续更新，胜负后可进入结算页。

- [ ] **Step 3: 本地运行试玩链路 3（失败不终止）**

Manual path:

1. 刻意在战斗中不恢复，促成失败
2. 验证显示“负伤脱身”文本
3. 验证流程仍可到达结果页和结局页

Expected: 没有卡死或状态错乱。

- [ ] **Step 4: 样式收尾**

把以下视觉基调体现在 `src/styles.css`：

```css
:root {
  color: #f3ead8;
  background: radial-gradient(circle at top, #2a2118, #120f0b 60%);
  font-family: "PingFang SC", "Noto Serif SC", serif;
}

button {
  border: 1px solid rgba(201, 164, 92, 0.6);
  background: rgba(201, 164, 92, 0.12);
  color: #f3ead8;
}
```

- [ ] **Step 5: 最终验证**

Run: `npm test && npm run build`

Expected: 全绿通过。

---

## Self-Review Checklist

- Spec coverage: 已覆盖工程初始化、角色创建、剧情节点、战斗、结局、本地存档、样式与测试。
- Placeholder scan: 无 TBD/TODO/“自行处理”等占位描述。
- Type consistency: `GameState`、`applyChoice`、`resolveEnding`、`BattleState`、`runBattleTurn` 在所有任务中命名一致。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-13-wuxia-web-mvp.md`.

Two execution options:

**1. Subagent-Driven (recommended)** - 我为每个任务派发独立子代理执行并在任务间复核。

**2. Inline Execution** - 我直接在当前会话里按计划实现并逐步验证。

如果你不特别指定，我建议直接走 **Inline Execution**，我会继续开始编码实现。
