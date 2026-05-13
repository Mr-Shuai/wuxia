import type { GameState } from '../game/types'

interface StatusPanelProps {
  state: GameState
}

export default function StatusPanel({ state }: StatusPanelProps) {
  return (
    <aside className="panel status-panel">
      <p className="eyebrow">当前状态</p>
      <dl className="status-grid">
        <div><dt>生命</dt><dd>{state.hp}/{state.maxHp}</dd></div>
        <div><dt>气</dt><dd>{state.qi}/{state.maxQi}</dd></div>
        <div><dt>势</dt><dd>{state.poise}/{state.maxPoise}</dd></div>
        <div><dt>侠义</dt><dd>{state.morality}</dd></div>
        <div><dt>通缉</dt><dd>{state.wantedLevel}</dd></div>
        <div><dt>名望</dt><dd>{state.reputation}</dd></div>
        <div><dt>人情债</dt><dd>{state.debt}</dd></div>
      </dl>
    </aside>
  )
}
