import { martialSkills } from '../game/data/martialSkills'
import { storyNodes } from '../game/data/story'
import { weapons } from '../game/data/weapons'
import type { GameState } from '../game/types'

interface StatusPanelProps {
  state: GameState
  compact?: boolean
  recentNodes?: string[]
  currentNodeId?: string
}

export default function StatusPanel({
  state,
  compact = false,
  recentNodes = [],
  currentNodeId,
}: StatusPanelProps) {
  const equippedWeapon = state.activeWeaponId ? weapons[state.activeWeaponId]?.name ?? state.activeWeaponId : '无'
  const learnedSkills = state.martialSkills.length > 0
    ? state.martialSkills.map((skillId) => martialSkills[skillId]?.name ?? skillId).join('、')
    : '暂无'
  const coreResources = [
    { label: '生命', current: state.hp, max: state.maxHp, tone: 'health' },
    { label: '气', current: state.qi, max: state.maxQi, tone: 'qi' },
    { label: '势', current: state.poise, max: state.maxPoise, tone: 'poise' },
  ] as const
  const journeyStats = [
    { label: '侠义', value: state.morality },
    { label: '通缉', value: state.wantedLevel },
    { label: '名望', value: state.reputation },
    { label: '人情债', value: state.debt },
    { label: '武学数', value: state.martialSkills.length },
    { label: '探索数', value: state.exploredScenes.length },
  ]

  return (
    <aside className={`panel status-panel${compact ? ' status-panel-compact' : ''}`}>
      <header className="status-panel-header">
        <p className="eyebrow">当前状态</p>
        <h2>行囊与气机</h2>
        <p className="muted">盯住气血，下一手才更稳。</p>
      </header>

      <section className="status-card status-resource-card" aria-label="核心资源">
        <div className="status-card-header">
          <div>
            <p className="eyebrow">核心气血</p>
            <h3>出手前先看这一口气还稳不稳</h3>
          </div>
        </div>

        <div className="status-resource-list">
          {coreResources.map((resource) => {
            const ratio = resource.max > 0 ? Math.max(0, Math.min(100, (resource.current / resource.max) * 100)) : 0

            return (
              <div key={resource.label} className={`status-resource-row status-resource-row-${resource.tone}`}>
                <div className="status-resource-meta">
                  <span>{resource.label}</span>
                  <strong>{resource.current}/{resource.max}</strong>
                </div>
                <div className="status-resource-track" aria-hidden="true">
                  <span className="status-resource-fill" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {compact && recentNodes.length > 0 ? (
        <section className="status-card status-progress-card" aria-label="推进概览">
          <div className="status-card-header status-card-header-inline">
            <p className="eyebrow">推进概览</p>
            <span className="story-phase-badge">主线节点</span>
          </div>

          <div className="story-progress-strip" aria-label="主线推进概览">
            {recentNodes.map((visitedNodeId, index) => (
              <span
                key={`${visitedNodeId}-${index}`}
                className={visitedNodeId === currentNodeId ? 'story-progress-pill current' : 'story-progress-pill'}
              >
                {storyNodes[visitedNodeId]?.title ?? visitedNodeId}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {!compact ? (
        <>
          <section className="status-card status-journey-card" aria-label="江湖阅历">
            <div className="status-card-header">
              <div>
                <p className="eyebrow">江湖阅历</p>
                <h3>名声、债与痕迹，都会跟着你走</h3>
              </div>
            </div>

            <dl className="status-grid">
              {journeyStats.map((item) => (
                <div key={item.label} className="status-stat-tile">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="status-detail-card status-card">
            <div className="status-card-header">
              <div>
                <p className="eyebrow">随身摘要</p>
                <h3>你现在真正能带上身的底气</h3>
              </div>
            </div>

            <div className="story-summary-row">
              <span className="story-summary-label">当前兵刃</span>
              <strong>{equippedWeapon}</strong>
            </div>
            <div className="story-summary-row">
              <span className="story-summary-label">当前招式</span>
              <strong>{learnedSkills}</strong>
            </div>
            <div className="story-summary-row">
              <span className="story-summary-label">探索进度</span>
              <strong>已探 {state.exploredScenes.length} 处</strong>
            </div>
          </section>
        </>
      ) : null}
    </aside>
  )
}
