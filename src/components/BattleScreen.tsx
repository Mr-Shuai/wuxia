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

export default function BattleScreen({ battle, onAction }: BattleScreenProps) {
  return (
    <main className="screen shell battle-layout">
      <section className="panel battle-panel">
        <div className="battle-header">
          <div>
            <p className="eyebrow">你</p>
            <p>生命 {battle.player.hp}/{battle.player.maxHp}</p>
            <p>气 {battle.player.qi}/{battle.player.maxQi}</p>
            <p>势 {battle.player.poise}/{battle.player.maxPoise}</p>
          </div>
          <div>
            <p className="eyebrow">{battle.enemy.name}</p>
            <p>生命 {battle.enemy.hp}</p>
            <p>气 {battle.enemy.qi}</p>
            <p>势 {battle.enemy.poise}</p>
          </div>
        </div>

        <div className="battle-actions">
          {(Object.keys(actionLabels) as PlayerAction[]).map((action) => (
            <button key={action} type="button" onClick={() => onAction(action)}>
              {actionLabels[action]}
            </button>
          ))}
        </div>
      </section>

      <aside className="panel battle-log">
        <p className="eyebrow">战斗日志</p>
        <ul>
          {battle.log.slice(-6).map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
      </aside>
    </main>
  )
}
