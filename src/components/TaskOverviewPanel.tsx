import { endings } from '../game/data/endings'
import { explorationMaps } from '../game/data/explorationMaps'
import { explorationScenes } from '../game/data/exploration'
import { storyNodes } from '../game/data/story'
import type { GamePhase, GameState } from '../game/types'

interface TaskOverviewPanelProps {
  phase: GamePhase
  state: GameState
}

function getTaskSummary(phase: GamePhase) {
  if (phase === 'exploration') {
    return '摸清这处场景留下的线索，再回到主线继续推进。'
  }

  if (phase === 'battle') {
    return '先稳住这一场交锋，再决定之后如何收束局势。'
  }

  if (phase === 'ending') {
    return '看清这一段余波，再决定是继续前行还是重新踏入江湖。'
  }

  return '沿着当前主线继续推进，下一手将决定局面如何收束。'
}

function getPhaseLabel(phase: GamePhase) {
  if (phase === 'story') {
    return '主线'
  }

  if (phase === 'exploration') {
    return '探索'
  }

  if (phase === 'battle') {
    return '战斗'
  }

  return '结局余波'
}

export default function TaskOverviewPanel({ phase, state }: TaskOverviewPanelProps) {
  const explorationMap = state.currentExplorationMapId ? explorationMaps[state.currentExplorationMapId] : undefined
  const storyNode = storyNodes[state.currentNodeId]
  const explorationNode = explorationScenes[state.currentNodeId]
  const ending = endings.find((item) => item.id === state.currentNodeId)
  const title = phase === 'exploration'
    ? explorationMap?.title ?? storyNode?.title ?? explorationNode?.title ?? ending?.title ?? state.currentNodeId
    : storyNode?.title ?? explorationNode?.title ?? ending?.title ?? state.currentNodeId
  const location = phase === 'exploration'
    ? explorationMap?.location ?? storyNode?.location ?? explorationNode?.location ?? '江湖未明之地'
    : storyNode?.location ?? explorationNode?.location ?? '江湖未明之地'
  const recentLogs = state.chapterLogs.slice(-3).reverse()

  return (
    <section className="game-overlay-section-grid task-overview-panel">
      <section className="game-overlay-card game-overlay-card-highlight">
        <p className="eyebrow">当前目标</p>
        <h3>当前目标</h3>
        <p className="game-overlay-keyline">{title}</p>
        <p className="muted">{getTaskSummary(phase)}</p>
        <div className="tag-row">
          <span>阶段：{getPhaseLabel(phase)}</span>
          <span>地点：{location}</span>
        </div>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">最近线索</p>
        <h3>最近线索</h3>
        {recentLogs.length > 0 ? (
          <ul className="result-list">
            {recentLogs.map((log, index) => <li key={`${index}-${log}`}>{log}</li>)}
          </ul>
        ) : (
          <p className="muted">眼下还没有新的线索记下。</p>
        )}
      </section>
    </section>
  )
}
