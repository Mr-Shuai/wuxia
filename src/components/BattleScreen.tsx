import type { BattleState, PlayerAction } from '../game/types'

interface BattleScreenProps {
  battle: BattleState
  onAction: (action: PlayerAction) => void
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

export default function BattleScreen({ battle, onAction }: BattleScreenProps) {
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

  return (
    <main className="screen shell battle-layout">
      <section className="panel battle-panel">
        <div className="battle-header">
          {renderFighterCard('你', playerView)}
          {renderFighterCard(battle.enemy.name, enemyView)}
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
                  {meta.badge ? <span className={`action-badge ${meta.badge === '推荐' ? 'badge-recommend' : 'badge-neutral'}`}>{meta.badge}</span> : null}
                </span>
                <span className="action-description">{meta.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="panel battle-log">
        <p className="eyebrow">战斗日志</p>
        <ul>
          {battle.log.slice(-6).map((line, index) => (
            <li key={`${line}-${index}`}>{highlightBattleLog(line)}</li>
          ))}
        </ul>
      </aside>
    </main>
  )
}
