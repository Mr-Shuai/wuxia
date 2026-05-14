import ResultScreen from './ResultScreen'
import StatusPanel from './StatusPanel'
import type { ExplorationAction, ExplorationScene, GameState } from '../game/types'

interface InlineResultState {
  text: string
  recentLogs: string[]
  streaming: boolean
}

interface ExplorationScreenProps {
  state: GameState
  scene: ExplorationScene
  onChoose: (action: ExplorationAction) => void
  inlineResult?: InlineResultState | null
  disableChoices?: boolean
}

function getActionRewardHint(action: ExplorationAction) {
  if (action.rewards?.weaponId) return '可能获得兵刃'
  if (action.rewards?.martialSkillId) return '可能悟出轻身法门'
  if (action.rewards?.itemId) return '可能摸到关键物件'
  return '会把这条线索推回主线'
}

function getExplorationMood(disableChoices: boolean, inlineResult: InlineResultState | null) {
  if (inlineResult?.streaming) {
    return {
      badge: '线索回响中',
      summary: '先看清刚得到的回声，新的落子还要稍等片刻。',
    }
  }

  if (disableChoices) {
    return {
      badge: '暂缓出手',
      summary: '局面已经有变化，先稳住心神，再决定摸哪一条暗线。',
    }
  }

  return {
    badge: '可继续探查',
    summary: '这里还留着可摸的痕迹，先看收益，再决定从哪一处下手。',
  }
}

export default function ExplorationScreen({
  state,
  scene,
  onChoose,
  inlineResult = null,
  disableChoices = false,
}: ExplorationScreenProps) {
  const explorationMood = getExplorationMood(disableChoices, inlineResult)

  return (
    <main className="screen shell two-column exploration-layout">
      <section className="panel story-panel">
        <header className="story-header exploration-hero">
          <div className="exploration-hero-copy">
            <p className="eyebrow">探索 · {scene.id}</p>
            <h1>{scene.title}</h1>
            <p className="location">{scene.location}</p>
          </div>
          <div className="exploration-hero-status">
            <span className={`exploration-phase-badge ${disableChoices ? 'exploration-phase-hold' : 'exploration-phase-open'}`}>
              {explorationMood.badge}
            </span>
            <p>{explorationMood.summary}</p>
          </div>
        </header>

        <section className="story-copy-card exploration-overview-card">
          <div className="choice-section-header exploration-overview-header">
            <div>
              <p className="eyebrow">现场速览</p>
              <h2>先看环境，再顺着暗线摸下去</h2>
            </div>
            <div className="exploration-meta-strip" aria-label="探索概览">
              <span className="exploration-meta-pill">可行动作 {scene.actions.length}</span>
              <span className="exploration-meta-pill">完成后回到主线</span>
            </div>
          </div>

          <div className="story-copy exploration-copy-card">
          {scene.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          </div>
        </section>

        {inlineResult ? (
          <ResultScreen
            eyebrow="探索所得"
            title="你刚摸到的线索，正在迅速拼成新局面"
            text={inlineResult.text}
            recentLogs={inlineResult.recentLogs}
            streaming={inlineResult.streaming}
          />
        ) : null}

        <section className="choice-section">
          <div className="choice-section-header">
            <div>
              <p className="eyebrow">探索动作</p>
              <h2>挑一条最顺手的路去摸</h2>
            </div>
            <span className="muted">{disableChoices ? '先稳住气息，把刚得的线索看清。' : '每一手都会把你重新推回主线。'}</span>
          </div>
          <div className="choice-list exploration-action-list">
            {scene.actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className="choice-button exploration-action-card"
                onClick={() => onChoose(action)}
                disabled={disableChoices}
              >
                <span className="exploration-action-kicker">线索 {String(index + 1).padStart(2, '0')}</span>
                <strong>{action.text}</strong>
                <span className="exploration-action-hint">{getActionRewardHint(action)}</span>
                <span className="exploration-action-meta">{action.once ? '仅首次有效' : '可多次尝试'}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
      <StatusPanel state={state} />
    </main>
  )
}
