import ResultScreen from './ResultScreen'
import type { BattleState, PlayerAction } from '../game/types'

interface InlineResultState {
  text: string
  recentLogs: string[]
  streaming: boolean
}

interface BattleScreenProps {
  battle: BattleState
  onAction: (action: PlayerAction) => void
  inlineResult?: InlineResultState | null
  onContinue?: () => void
}

const actionLabels: Record<PlayerAction, string> = {
  attack: '攻击',
  focus: '运气',
  guard: '防守',
  break: '破招',
}

type FighterViewState = {
  hp: number
  qi: number
  poise: number
  maxHp: number
  maxQi: number
  maxPoise: number
}

type ActionMeta = {
  description: string
  badge?: '推荐' | '收益一般'
}

type OutcomeMeta = {
  badge: string
  summary: string
}

function getStatusTags(fighter: FighterViewState) {
  const tags: string[] = []

  if (fighter.poise === 0) tags.push('破绽中')
  if (fighter.qi <= 2) tags.push('气不足')
  if (fighter.hp <= fighter.maxHp * 0.35) tags.push('危险')
  if (fighter.poise >= fighter.maxPoise * 0.7) tags.push('稳势')

  return tags
}

function getCombatHint(battle: BattleState) {
  if (battle.enemy.poise === 0) return '敌方势已崩，正是破招的最好时机。'
  if (battle.player.hp <= battle.player.maxHp * 0.35) return '你已陷入危险，优先防守会更稳。'
  if (battle.player.qi <= 2) return '你的气不足，先运气能稳住节奏。'
  if (battle.enemy.poise >= 7) return '敌方架势尚稳，先攻击压势更有效。'
  return '双方仍在试探，攻击是最稳妥的起手。'
}

function getActionMeta(action: PlayerAction, battle: BattleState): ActionMeta {
  if (action === 'attack') {
    return {
      description: '稳定削减对手生命与势',
      badge: battle.enemy.poise > 5 && battle.enemy.poise !== 0 ? '推荐' : undefined,
    }
  }

  if (action === 'focus') {
    return {
      description: '恢复气并回稳架势',
      badge:
        battle.player.qi <= 2
          ? '推荐'
          : battle.player.qi >= battle.player.maxQi - 1
            ? '收益一般'
            : undefined,
    }
  }

  if (action === 'guard') {
    return {
      description: '降低本回合承伤风险',
      badge: battle.player.hp <= battle.player.maxHp * 0.35 ? '推荐' : undefined,
    }
  }

  return {
    description: '对破绽敌人收益最高',
    badge: battle.enemy.poise === 0 ? '推荐' : '收益一般',
  }
}

function getOutcomeMeta(battle: BattleState): OutcomeMeta {
  if (battle.outcome === 'victory') {
    return {
      badge: '胜局已定',
      summary: '你已经压住对手，只需收束余波再继续前行。',
    }
  }

  if (battle.outcome === 'defeat') {
    return {
      badge: '暂失先机',
      summary: '这一阵已经分出胜负，先看清代价，再决定下一步。',
    }
  }

  return {
    badge: '交锋中',
    summary: '先看清局势，再决定这一手是压势、稳气还是收招。',
  }
}

function getMeterWidth(value: number, max: number) {
  if (max <= 0) return '0%'
  return `${Math.max(0, Math.min(100, (value / max) * 100))}%`
}

function highlightBattleLog(line: string) {
  const tokens = ['破绽', '破招', '伤害', '调匀气息', '逼退', '负伤', '胜利']
  const marked = line.replace(new RegExp(`(${tokens.join('|')})`, 'g'), '@@$1@@')

  return marked.split('@@').map((part, index) =>
    tokens.includes(part) ? (
      <mark key={`${part}-${index}`} className="battle-log-mark">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  )
}

function renderFighterCard(label: string, fighter: FighterViewState) {
  const rows = [
    { name: '生命', value: fighter.hp, max: fighter.maxHp, type: 'hp' },
    { name: '气', value: fighter.qi, max: fighter.maxQi, type: 'qi' },
    { name: '势', value: fighter.poise, max: fighter.maxPoise, type: 'poise' },
  ] as const

  const tags = getStatusTags(fighter)

  return (
    <div className="fighter-card">
      <p className="eyebrow">{label}</p>
      <div className="meter-group">
        {rows.map((row) => (
          <div key={`${label}-${row.name}`} className="meter-row">
            <div className="meter-label-row">
              <span>{row.name}</span>
              <span>
                {row.value}/{row.max}
              </span>
            </div>
            <div className="meter-track" aria-hidden="true">
              <div className={`meter-fill ${row.type}`} style={{ width: getMeterWidth(row.value, row.max) }} />
            </div>
          </div>
        ))}
      </div>
      <div className="battle-tags">
        {tags.length > 0 ? tags.map((tag) => <span key={`${label}-${tag}`} className="battle-tag">{tag}</span>) : <span className="battle-tag muted-tag">暂无异状</span>}
      </div>
    </div>
  )
}

export default function BattleScreen({
  battle,
  onAction,
  inlineResult = null,
  onContinue,
}: BattleScreenProps) {
  const playerView: FighterViewState = {
    hp: battle.player.hp,
    qi: battle.player.qi,
    poise: battle.player.poise,
    maxHp: battle.player.maxHp,
    maxQi: battle.player.maxQi,
    maxPoise: battle.player.maxPoise,
  }

  const enemyView: FighterViewState = {
    hp: battle.enemy.hp,
    qi: battle.enemy.qi,
    poise: battle.enemy.poise,
    maxHp: Math.max(battle.enemy.hp, 20),
    maxQi: Math.max(battle.enemy.qi, 6),
    maxPoise: Math.max(battle.enemy.poise, 10),
  }

  const actionOrder: PlayerAction[] = ['attack', 'focus', 'guard', 'break']
  const showResolvedState = battle.outcome !== 'ongoing' && inlineResult
  const outcomeMeta = getOutcomeMeta(battle)
  const visibleLogCount = Math.min(6, battle.log.length)

  return (
    <main className="screen shell battle-layout">
      <section className="panel battle-panel">
        <header className="battle-scene-header">
          <div className="battle-scene-copy">
            <p className="eyebrow">交锋</p>
            <h1>{battle.title}</h1>
            <p className="location">对手：{battle.enemy.name}</p>
          </div>
          <div className="battle-scene-status-card">
            <span className={`battle-phase-badge ${battle.outcome === 'ongoing' ? 'phase-ongoing' : battle.outcome === 'victory' ? 'phase-victory' : 'phase-defeat'}`}>
              {outcomeMeta.badge}
            </span>
            <p>{outcomeMeta.summary}</p>
          </div>
        </header>

        <div className="battle-header">
          {renderFighterCard('你', playerView)}
          {renderFighterCard(battle.enemy.name, enemyView)}
        </div>

        {showResolvedState ? (
          <>
            <ResultScreen
              eyebrow="胜负已分"
              title="战局已定"
              text={inlineResult.text}
              recentLogs={inlineResult.recentLogs}
              streaming={inlineResult.streaming}
            />
            {onContinue ? (
              <button
                type="button"
                className="primary-button result-continue-button"
                onClick={onContinue}
                disabled={inlineResult.streaming}
              >
                继续前行
              </button>
            ) : null}
          </>
        ) : (
          <>
            <section className="battle-command-panel">
              <div className="battle-command-header">
                <div>
                  <p className="eyebrow">可选招式</p>
                  <h2>先看局势，再落这一手</h2>
                </div>
                <span className="muted">每回合只能出一手，尽量顺着提醒去抢节奏。</span>
              </div>

              <section className="battle-hint">
                <p className="eyebrow">当前局势</p>
                <p>{getCombatHint(battle)}</p>
              </section>

              <div className="battle-actions">
                {actionOrder.map((action) => {
                  const meta = getActionMeta(action, battle)

                  return (
                    <button key={action} type="button" className="action-card" onClick={() => onAction(action)}>
                      <span className="action-title-row">
                        <strong>{actionLabels[action]}</strong>
                        {meta.badge ? <span className={`action-badge ${meta.badge === '推荐' ? 'badge-recommend' : 'badge-neutral'}`}>{meta.badge}</span> : null}</span>
                      <span className="action-description">{meta.description}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </section>

      <aside className="panel battle-log">
        <div className="battle-log-header">
          <div>
            <p className="eyebrow">战斗日志</p>
            <h2>近身交锋</h2>
          </div>
          <span className="battle-log-count">最近 {visibleLogCount} 条</span>
        </div>
        <ul>
          {battle.log.slice(-6).map((line, index) => (
            <li key={`${line}-${index}`}>{highlightBattleLog(line)}</li>
          ))}
        </ul>
      </aside>
    </main>
  )
}
