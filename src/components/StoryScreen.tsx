import ChoiceList from './ChoiceList'
import ResultScreen from './ResultScreen'
import StatusPanel from './StatusPanel'
import { storyNodes } from '../game/data/story'
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
          </div>
        </section>

        <section
          className={`story-focus-grid${inlineResult ? ' story-focus-grid-with-echo' : ' story-focus-grid-single'}`}
        >
          <div className="story-copy story-copy-card story-copy-card-compact">
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
              title=""
              text={inlineResult.text}
              className="story-echo-panel story-echo-panel-narrow"
              streaming={inlineResult.streaming}
            />
          ) : null}
        </section>

        <section className="choice-section">
          <div className="choice-section-header">
            <div className="choice-section-heading">
              <p className="eyebrow">行动抉择</p>
              <div className="choice-section-title-row">
                <h2>接下来你准备怎么把这一段主线推到底</h2>
                <span className="choice-count">可选 {availableChoices.length} 手</span>
              </div>
            </div>
            <span className="choice-section-hint muted">
              {disableChoices ? '回声未落，暂不可连出下一手。' : '每个选择都会把主线推向不同的收束方式。'}
            </span>
          </div>
          <ChoiceList choices={availableChoices} onChoose={onChoose} disabled={disableChoices} />
        </section>
      </section>
      <StatusPanel state={state} compact recentNodes={recentNodes} currentNodeId={node.id} />
    </main>
  )
}
