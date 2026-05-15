# Overlay Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有游戏内页面增加右下角单按钮入口，并通过整页覆盖弹窗展示任务、状态、背包三类信息，默认打开任务页签。

**Architecture:** 在 `src/App.tsx` 顶层统一管理入口显隐、弹窗开关和当前页签，避免把逻辑散落到各页面组件。新增一个悬浮入口组件和一个整页弹窗组件，弹窗内部再拆成任务、状态、背包三个只读面板；状态与背包数据直接从现有 `GameState` 派生，任务页签使用当前 `phase`、节点配置和最近日志生成总览。

**Tech Stack:** React 18、TypeScript、Vitest、Testing Library、CSS

---

## File Structure

### Create

- `src/components/GameQuickAccessButton.tsx`
- `src/components/GameOverlayPanel.tsx`
- `src/components/TaskOverviewPanel.tsx`
- `src/components/StatusOverviewPanel.tsx`
- `src/components/InventoryOverviewPanel.tsx`

### Modify

- `src/App.tsx`
- `src/App.test.tsx`
- `src/styles.css`

### Responsibility Notes

- `src/App.tsx`：统一控制入口显示范围、弹窗开关、默认页签与数据传递。
- `src/components/GameQuickAccessButton.tsx`：右下角单按钮，保持纯展示与点击回调。
- `src/components/GameOverlayPanel.tsx`：遮罩、弹窗容器、页签切换、关闭按钮。
- `src/components/TaskOverviewPanel.tsx`：根据 `phase` 和当前节点生成任务总览。
- `src/components/StatusOverviewPanel.tsx`：展示完整状态信息，不复用侧栏紧凑布局。
- `src/components/InventoryOverviewPanel.tsx`：展示当前兵刃、背包物件、已学武学与空态。
- `src/App.test.tsx`：验证入口显示范围、弹窗默认页签、页签切换与关闭行为。
- `src/styles.css`：新增悬浮入口与整页弹窗样式，不破坏现有主线/探索/战斗布局。

---

### Task 1: 为右下角入口与整页弹窗写失败测试

**Files:**
- Modify: `src/App.test.tsx`
- Read: `src/App.tsx`

- [ ] **Step 1: 在 `src/App.test.tsx` 顶部补充新的工具函数与依赖导入**

```tsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'
import { createGameState } from './game/engine/createGameState'

function seedGameAtNode(nodeId: string) {
  const gameState = createGameState({
    name: '阿青',
    originId: 'escort',
    talentId: 'iron-bone',
  })

  gameState.currentNodeId = nodeId
  gameState.visitedNodes = ['N00', 'N10', 'N11', nodeId]
  gameState.chapterLogs = [
    '你踏入了风雨欲来的江湖。',
    '你冒雨生火，为密探止了血，也欠下了一段人情。',
    '你把残篇交还，换来一份信任，也让自己站到了更亮的地方。',
  ]
  gameState.inventory = ['old-iron-sword']
  gameState.activeWeaponId = 'old-iron-sword'
  gameState.martialSkills = ['catwalk-step']

  window.localStorage.setItem('wuxia-save', JSON.stringify({ gameState }))
}

function getQuickAccessButton() {
  return screen.getByRole('button', { name: '江湖随览' })
}
```

- [ ] **Step 2: 写第一个失败测试，验证开始页与创建页不显示入口，而剧情页显示入口**

```tsx
it('shows the quick access button only on game phases', async () => {
  const user = userEvent.setup()

  render(<App />)

  expect(screen.queryByRole('button', { name: '江湖随览' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '开始江湖' }))
  expect(screen.queryByRole('button', { name: '江湖随览' })).not.toBeInTheDocument()

  await user.type(screen.getByLabelText('角色名'), '阿青')
  await user.click(screen.getByRole('button', { name: '江湖浪客' }))
  await user.click(screen.getByRole('button', { name: '稳心' }))
  await user.click(screen.getByRole('button', { name: '踏入江湖' }))

  expect(getQuickAccessButton()).toBeInTheDocument()
})
```

- [ ] **Step 3: 运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: FAIL，因为当前应用还没有右下角单按钮和整页弹窗。

- [ ] **Step 4: 写第二个失败测试，验证打开后默认在任务页签，并可切到状态与背包**

```tsx
it('opens overlay on tasks tab by default and switches tabs', async () => {
  const user = userEvent.setup()

  seedGameAtNode('N11')
  render(<App />)

  await user.click(screen.getByRole('button', { name: '继续游戏' }))
  await user.click(getQuickAccessButton())

  const dialog = screen.getByRole('dialog', { name: '江湖随览' })

  expect(within(dialog).getByRole('tab', { name: '任务', selected: true })).toBeInTheDocument()
  expect(within(dialog).getByText('当前目标')).toBeInTheDocument()
  expect(within(dialog).getByText('酒楼听风')).toBeInTheDocument()

  await user.click(within(dialog).getByRole('tab', { name: '状态' }))
  expect(within(dialog).getByText('核心资源')).toBeInTheDocument()
  expect(within(dialog).getByText('江湖阅历')).toBeInTheDocument()

  await user.click(within(dialog).getByRole('tab', { name: '背包' }))
  expect(within(dialog).getByText('当前兵刃')).toBeInTheDocument()
  expect(within(dialog).getByText('旧铁剑')).toBeInTheDocument()
})
```

- [ ] **Step 5: 写第三个失败测试，验证遮罩、关闭按钮、Esc 都能关闭弹窗**

```tsx
it('closes the overlay via close button, backdrop, and escape', async () => {
  const user = userEvent.setup()

  seedGameAtNode('N11')
  render(<App />)

  await user.click(screen.getByRole('button', { name: '继续游戏' }))

  await user.click(getQuickAccessButton())
  await user.click(screen.getByRole('button', { name: '关闭江湖随览' }))
  expect(screen.queryByRole('dialog', { name: '江湖随览' })).not.toBeInTheDocument()

  await user.click(getQuickAccessButton())
  await user.click(screen.getByTestId('overlay-backdrop'))
  expect(screen.queryByRole('dialog', { name: '江湖随览' })).not.toBeInTheDocument()

  await user.click(getQuickAccessButton())
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: '江湖随览' })).not.toBeInTheDocument()
})
```

- [ ] **Step 6: 再次运行测试确认失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: FAIL，提示找不到入口按钮、dialog、tab 或关闭控件。

---

### Task 2: 搭建右下角单按钮与弹窗骨架

**Files:**
- Create: `src/components/GameQuickAccessButton.tsx`
- Create: `src/components/GameOverlayPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 `src/components/GameQuickAccessButton.tsx`，实现纯展示入口按钮**

```tsx
interface GameQuickAccessButtonProps {
  onOpen: () => void
}

export default function GameQuickAccessButton({ onOpen }: GameQuickAccessButtonProps) {
  return (
    <button
      type="button"
      className="game-quick-access-button"
      aria-label="江湖随览"
      onClick={onOpen}
    >
      江湖随览
    </button>
  )
}
```

- [ ] **Step 2: 创建 `src/components/GameOverlayPanel.tsx`，先实现遮罩、标题、页签骨架和关闭行为接口**

```tsx
import { useEffect } from 'react'
import type { ReactNode } from 'react'

export type OverlayTab = 'tasks' | 'status' | 'inventory'

interface GameOverlayPanelProps {
  activeTab: OverlayTab
  onChangeTab: (tab: OverlayTab) => void
  onClose: () => void
  children: ReactNode
}

const tabs: { key: OverlayTab; label: string }[] = [
  { key: 'tasks', label: '任务' },
  { key: 'status', label: '状态' },
  { key: 'inventory', label: '背包' },
]

export default function GameOverlayPanel({ activeTab, onChangeTab, onClose, children }: GameOverlayPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="game-overlay-root">
      <button type="button" className="game-overlay-backdrop" data-testid="overlay-backdrop" aria-label="关闭江湖随览遮罩" onClick={onClose} />
      <section className="game-overlay-panel" role="dialog" aria-modal="true" aria-label="江湖随览">
        <header className="game-overlay-header">
          <div>
            <p className="eyebrow">江湖随览</p>
            <h2>总览当前行程、状态与行囊</h2>
          </div>
          <button type="button" className="game-overlay-close" aria-label="关闭江湖随览" onClick={onClose}>关闭</button>
        </header>

        <div className="game-overlay-tabs" role="tablist" aria-label="江湖随览页签">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={activeTab === tab.key ? 'game-overlay-tab active' : 'game-overlay-tab'}
              onClick={() => onChangeTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="game-overlay-body">{children}</div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: 在 `src/App.tsx` 顶部引入新组件并增加弹窗状态**

```tsx
import GameOverlayPanel, { type OverlayTab } from './components/GameOverlayPanel'
import GameQuickAccessButton from './components/GameQuickAccessButton'

const [isOverlayOpen, setIsOverlayOpen] = useState(false)
const [activeOverlayTab, setActiveOverlayTab] = useState<OverlayTab>('tasks')

function openOverlay(defaultTab: OverlayTab = 'tasks') {
  setActiveOverlayTab(defaultTab)
  setIsOverlayOpen(true)
}

function closeOverlay() {
  setIsOverlayOpen(false)
  setActiveOverlayTab('tasks')
}
```

- [ ] **Step 4: 在 `src/App.tsx` 中增加“游戏内 phase 才显示入口”的判断**

```tsx
const showQuickAccess = phase === 'story' || phase === 'exploration' || phase === 'battle' || phase === 'ending'
```

- [ ] **Step 5: 在每个游戏内 phase 的返回 JSX 外层挂载入口和弹窗骨架**

```tsx
function renderWithQuickAccess(content: React.ReactNode) {
  return (
    <>
      {content}
      {showQuickAccess ? <GameQuickAccessButton onOpen={() => openOverlay('tasks')} /> : null}
      {showQuickAccess && isOverlayOpen ? (
        <GameOverlayPanel activeTab={activeOverlayTab} onChangeTab={setActiveOverlayTab} onClose={closeOverlay}>
          <section className="game-overlay-placeholder-card">
            <p className="eyebrow">占位内容</p>
            <h3>当前页签开发中</h3>
          </section>
        </GameOverlayPanel>
      ) : null}
    </>
  )
}
```

并把：

```tsx
return <StoryScreen ... />
```

改成：

```tsx
return renderWithQuickAccess(<StoryScreen ... />)
```

同样处理 `exploration`、`battle`、`ending` 分支；`start` 与 `create` 保持原样。

- [ ] **Step 6: 运行测试，验证入口显示范围与 dialog 骨架通过，内容测试仍失败**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: 入口存在性与关闭行为相关断言开始通过，但任务/状态/背包内容断言仍失败。

---

### Task 3: 实现任务、状态、背包三个面板

**Files:**
- Create: `src/components/TaskOverviewPanel.tsx`
- Create: `src/components/StatusOverviewPanel.tsx`
- Create: `src/components/InventoryOverviewPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 `src/components/TaskOverviewPanel.tsx`，根据 phase 与节点生成任务总览**

```tsx
import { explorationScenes } from '../game/data/exploration'
import { storyNodes } from '../game/data/story'
import type { GamePhase, GameState } from '../game/types'

interface TaskOverviewPanelProps {
  phase: GamePhase
  state: GameState
}

function getTaskSummary(phase: GamePhase) {
  if (phase === 'exploration') return '摸清这处场景留下的线索，再回到主线继续推进。'
  if (phase === 'battle') return '先稳住这一场交锋，再决定之后如何收束局势。'
  if (phase === 'ending') return '看清这一段余波，再决定是继续前行还是重新踏入江湖。'
  return '沿着当前主线继续推进，下一手将决定局面如何收束。'
}

export default function TaskOverviewPanel({ phase, state }: TaskOverviewPanelProps) {
  const storyNode = storyNodes[state.currentNodeId]
  const explorationNode = explorationScenes[state.currentNodeId]
  const title = storyNode?.title ?? explorationNode?.title ?? state.currentNodeId
  const location = storyNode?.location ?? explorationNode?.location ?? '江湖未明之地'
  const recentLogs = state.chapterLogs.slice(-3).reverse()

  return (
    <section className="game-overlay-section-grid">
      <section className="game-overlay-card">
        <p className="eyebrow">当前目标</p>
        <h3>{title}</h3>
        <p className="muted">{getTaskSummary(phase)}</p>
        <div className="tag-row">
          <span>阶段：{phase === 'story' ? '主线' : phase === 'exploration' ? '探索' : phase === 'battle' ? '战斗' : '结局余波'}</span>
          <span>地点：{location}</span>
        </div>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">最近线索</p>
        <ul className="result-list">
          {recentLogs.map((log) => <li key={log}>{log}</li>)}
        </ul>
      </section>
    </section>
  )
}
```

- [ ] **Step 2: 创建 `src/components/StatusOverviewPanel.tsx`，完整展示状态卡片**

```tsx
import { martialSkills } from '../game/data/martialSkills'
import { weapons } from '../game/data/weapons'
import type { GameState } from '../game/types'

interface StatusOverviewPanelProps {
  state: GameState
}

export default function StatusOverviewPanel({ state }: StatusOverviewPanelProps) {
  const equippedWeapon = state.activeWeaponId ? weapons[state.activeWeaponId]?.name ?? state.activeWeaponId : '无'
  const learnedSkills = state.martialSkills.length > 0
    ? state.martialSkills.map((skillId) => martialSkills[skillId]?.name ?? skillId).join('、')
    : '暂无已学武学'

  return (
    <section className="game-overlay-section-grid">
      <section className="game-overlay-card">
        <p className="eyebrow">核心资源</p>
        <dl className="status-grid">
          <div className="status-stat-tile"><dt>生命</dt><dd>{state.hp}/{state.maxHp}</dd></div>
          <div className="status-stat-tile"><dt>气</dt><dd>{state.qi}/{state.maxQi}</dd></div>
          <div className="status-stat-tile"><dt>势</dt><dd>{state.poise}/{state.maxPoise}</dd></div>
        </dl>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">江湖阅历</p>
        <dl className="status-grid">
          <div className="status-stat-tile"><dt>侠义</dt><dd>{state.morality}</dd></div>
          <div className="status-stat-tile"><dt>通缉</dt><dd>{state.wantedLevel}</dd></div>
          <div className="status-stat-tile"><dt>名望</dt><dd>{state.reputation}</dd></div>
          <div className="status-stat-tile"><dt>人情债</dt><dd>{state.debt}</dd></div>
        </dl>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">当前配置</p>
        <div className="story-summary-row"><span className="story-summary-label">当前兵刃</span><strong>{equippedWeapon}</strong></div>
        <div className="story-summary-row"><span className="story-summary-label">已学武学</span><strong>{learnedSkills}</strong></div>
      </section>
    </section>
  )
}
```

- [ ] **Step 3: 创建 `src/components/InventoryOverviewPanel.tsx`，完整展示背包与空态**

```tsx
import { martialSkills } from '../game/data/martialSkills'
import { weapons } from '../game/data/weapons'
import type { GameState } from '../game/types'

interface InventoryOverviewPanelProps {
  state: GameState
}

export default function InventoryOverviewPanel({ state }: InventoryOverviewPanelProps) {
  const equippedWeapon = state.activeWeaponId ? weapons[state.activeWeaponId]?.name ?? state.activeWeaponId : '无'
  const itemNames = state.inventory.length > 0
    ? state.inventory.map((itemId) => weapons[itemId]?.name ?? itemId)
    : []
  const skillNames = state.martialSkills.length > 0
    ? state.martialSkills.map((skillId) => martialSkills[skillId]?.name ?? skillId)
    : []

  return (
    <section className="game-overlay-section-grid">
      <section className="game-overlay-card">
        <p className="eyebrow">当前兵刃</p>
        <h3>{equippedWeapon}</h3>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">背包物件</p>
        {itemNames.length > 0 ? <ul className="result-list">{itemNames.map((name) => <li key={name}>{name}</li>)}</ul> : <p className="muted">目前尚无可整理物件。</p>}
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">已学武学</p>
        {skillNames.length > 0 ? <ul className="result-list">{skillNames.map((name) => <li key={name}>{name}</li>)}</ul> : <p className="muted">暂无已学武学。</p>}
      </section>
    </section>
  )
}
```

- [ ] **Step 4: 在 `src/App.tsx` 中引入三个面板，并按当前页签渲染真实内容**

```tsx
import InventoryOverviewPanel from './components/InventoryOverviewPanel'
import StatusOverviewPanel from './components/StatusOverviewPanel'
import TaskOverviewPanel from './components/TaskOverviewPanel'

function renderOverlayContent() {
  if (!gameState) return null

  if (activeOverlayTab === 'tasks') {
    return <TaskOverviewPanel phase={phase} state={gameState} />
  }

  if (activeOverlayTab === 'status') {
    return <StatusOverviewPanel state={gameState} />
  }

  return <InventoryOverviewPanel state={gameState} />
}
```

并把 Task 2 中的占位内容替换为：

```tsx
<GameOverlayPanel activeTab={activeOverlayTab} onChangeTab={setActiveOverlayTab} onClose={closeOverlay}>
  {renderOverlayContent()}
</GameOverlayPanel>
```

- [ ] **Step 5: 运行 `App` 测试，验证默认任务页签与页签切换通过**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx`

Expected: PASS，任务 / 状态 / 背包三个页签内容断言全部通过。

---

### Task 4: 增加右下角入口与整页弹窗样式并做最终验证

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: 为右下角入口按钮补基础样式**

```css
.game-quick-access-button {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 20;
  min-width: 120px;
  border-radius: 999px;
  padding: 0.8rem 1rem;
  background: linear-gradient(180deg, rgba(41, 28, 19, 0.94), rgba(18, 13, 10, 0.98));
  border: 1px solid rgba(210, 171, 84, 0.42);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
}

.game-quick-access-button:hover {
  border-color: rgba(231, 193, 113, 0.88);
}
```

- [ ] **Step 2: 为整页遮罩与弹窗主体补样式**

```css
.game-overlay-root {
  position: fixed;
  inset: 0;
  z-index: 30;
}

.game-overlay-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(7, 6, 4, 0.72);
}

.game-overlay-panel {
  position: relative;
  z-index: 1;
  width: min(980px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  margin: 1rem auto;
  padding: 1.1rem 1.15rem 1.2rem;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(28, 21, 15, 0.96), rgba(12, 10, 8, 0.98));
  border: 1px solid rgba(210, 171, 84, 0.26);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.38);
}
```

- [ ] **Step 3: 为页签与内容卡片补样式**

```css
.game-overlay-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.game-overlay-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.game-overlay-tab.active {
  border-color: rgba(231, 193, 113, 0.88);
  background: rgba(201, 164, 92, 0.2);
}

.game-overlay-section-grid {
  display: grid;
  gap: 0.9rem;
}

.game-overlay-card {
  display: grid;
  gap: 0.7rem;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(201, 164, 92, 0.18);
}
```

- [ ] **Step 4: 为小屏场景补响应式规则**

```css
@media (max-width: 900px) {
  .game-quick-access-button {
    right: 1rem;
    bottom: 1rem;
    min-width: 0;
  }

  .game-overlay-panel {
    width: min(100vw - 1rem, 980px);
    max-height: calc(100vh - 1rem);
    margin: 0.5rem auto;
  }

  .game-overlay-header {
    flex-direction: column;
  }

  .game-overlay-tabs {
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 5: 跑相关测试与构建，确认功能与样式接入完成**

Run: `npm test --prefix "/Users/bytedance/git_hub/wuxia" -- src/App.test.tsx src/components/StoryScreen.test.tsx src/components/ExplorationScreen.test.tsx src/components/StatusPanel.test.tsx`

Expected: PASS，所有相关测试通过。

Run: `npm run --prefix "/Users/bytedance/git_hub/wuxia" build`

Expected: `vite build` 成功输出 `dist/index.html` 与打包产物，无 TypeScript 报错。

---

## Self-Review

### Spec coverage

- 右下角单按钮入口：Task 2 + Task 4 覆盖。
- 所有游戏内页面显示、开始页/创建页不显示：Task 1 + Task 2 覆盖。
- 整页覆盖弹窗：Task 2 + Task 4 覆盖。
- 默认任务页签：Task 1 + Task 3 覆盖。
- 任务 / 状态 / 背包展示：Task 3 覆盖。
- 关闭按钮、遮罩、Esc：Task 1 + Task 2 覆盖。

### Placeholder scan

- 无 TBD / TODO / “自行实现” 式占位。
- 每个代码步骤都给出了具体文件、代码片段和命令。

### Type consistency

- 页签类型统一为 `OverlayTab = 'tasks' | 'status' | 'inventory'`。
- 面板组件统一接收 `GameState`，任务面板额外接收 `GamePhase`。
- `App.tsx` 顶层负责传递 `phase` 与 `gameState`，与现有状态模型一致。
