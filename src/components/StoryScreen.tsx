import ChoiceList from './ChoiceList'
import ResultScreen from './ResultScreen'
import StatusPanel from './StatusPanel'
import { martialSkills } from '../game/data/martialSkills'
import { storyNodes } from '../game/data/story'
import { weapons } from '../game/data/weapons'
import { isChoiceAvailable } from '../game/engine/storyEngine'
import type { GameState, StoryChoice } from '../game/types'

interface InlineResultState {
  text: string
  recentLogs: string[]
  streaming: boolean
}

interface StoryScreenProps {
  state: GameState
  onChoose: (choice: StoryChoice) => void
  inlineResult?: InlineResultState | null
  disableChoices?: boolean
}

export default function StoryScreen({
  state,
  onChoose,
  inlineResult = null,
  disableChoices = false,
}: StoryScreenProps) {
  const node = storyNodes[state.currentNodeId]
  const availableChoices = node.choices.filter((choice) => isChoiceAvailable(state, choice))
  const recentNodes = state.visitedNodes.slice(-4)
  const recentLogs = state.chapterLogs.slice(-3)
  const equippedWeapon = state.activeWeaponId ? weapons[state.activeWeaponId]?.name ?? state.activeWeaponId : '未持兵刃'
  const learnedSkills = state.martialSkills.length > 0
    ? state.martialSkills.map((skillId) => martialSkills[skillId]?.name ?? skillId).join('、')
    : '尚未悟出'

  return (
    <main className="screen shell two-column mainline-screen">
      <section className="panel story-panel mainline-panel">
        <section className="story-hero">
          <div className="story-header story-hero-header">
            <div className="story-hero-copy">
              <p className="eyebrow">主线推进中</p>
              <h1>{node.title}</h1>
              <p className="location">{node.location}</p>
              <div className="story-hero-meta" aria-label="当前主线信息">
                <span className="story-hero-meta-pill">节点 {node.id}</span>
                <span className="story-hero-meta-pill">已行 {Math.max(0, state.visitedNodes.length - 1)} 步</span>
              </div>
            </div>
            <div className="story-hero-status">
              <span className="story-phase-badge">主线节点</span>
              <p>已走过 {Math.max(0, state.visitedNodes.length - 1)} 个剧情节点，当前仍在主线推进中。</p>
            </div>
          </div>

          <div className="story-overview-grid">
            <section className="story-overview-card">
              <p className="eyebrow">推进概览</p>
              <div className="story-progress-strip" aria-label="主线推进概览">
                {recentNodes.map((visitedNodeId, index) => (
                  <span key={`${visitedNodeId}-${index}`} className={visitedNodeId === node.id ? 'story-progress-pill current' : 'story-progress-pill'}>
                    {storyNodes[visitedNodeId]?.title ?? visitedNodeId}
                  </span>
                ))}
              </div>
              <p className="muted">你已经把这条线一路推到眼前这一步，接下来这一手会决定这一段主线如何收束。</p>
            </section>

            <section className="story-overview-card story-overview-card-accent">
              <p className="eyebrow">随身摘要</p>
              <div className="story-summary-row">
                <span className="story-summary-label">携带兵刃</span>
                <strong>{equippedWeapon}</strong>
              </div>
              <div className="story-summary-row">
                <span className="story-summary-label">已会招式</span>
                <strong>{learnedSkills}</strong>
              </div>
            </section>
          </div>
        </section>

        <section className="story-focus-grid">
          <div className="story-copy story-copy-card">
            <div className="story-copy-header">
              <p className="eyebrow">{node.id}</p>
              <h2>当前局势</h2>
            </div>
            <div className="story-copy-body">
              {node.content.map((paragraph, index) => (
                <p key={paragraph} className={index === 0 ? 'story-lead-paragraph' : undefined}>{paragraph}</p>
              ))}
            </div>
          </div>

          {inlineResult ? (
            <ResultScreen
              eyebrow="江湖回声"
              title="先看清这一手落下后，局面到底变了什么"
              text={inlineResult.text}
              className="story-echo-panel"
              streaming={inlineResult.streaming}
            />
          ) : (
            <section className="story-log-card story-log-compact">
              <div className="story-log-header">
                <div>
                  <p className="eyebrow">最近动向</p>
                  <h2>只保留离当前节点最近的几步</h2>
                </div>
              </div>
              <ul className="story-log-list story-log-list-compact">
                {recentLogs.map((log) => (
                  <li key={log}>{log}</li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <section className="choice-section">
          <div className="choice-section-header">
            <div>
              <p className="eyebrow">行动抉择</p>
              <h2>接下来你准备怎么把这一段主线推到底</h2>
            </div>
            <span className="muted">{disableChoices ? '回声未落，暂不可连出下一手。' : '每个选择都会把主线推向不同的收束方式。'}</span>
          </div>
          <ChoiceList choices={availableChoices} onChoose={onChoose} disabled={disableChoices} />
        </section>
      </section>
      <StatusPanel state={state} />
    </main>
  )
}
