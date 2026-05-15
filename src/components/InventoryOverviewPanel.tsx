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
    <section className="game-overlay-section-grid inventory-overview-panel">
      <section className="game-overlay-card game-overlay-card-highlight">
        <p className="eyebrow">背包</p>
        <h3>当前兵刃</h3>
        <p className="game-overlay-keyline">{equippedWeapon}</p>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">背包</p>
        <h3>背包物件</h3>
        {itemNames.length > 0 ? (
          <ul className="result-list">
            {itemNames.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}
          </ul>
        ) : (
          <p className="muted">目前尚无可整理物件。</p>
        )}
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">背包</p>
        <h3>已学武学</h3>
        {skillNames.length > 0 ? (
          <ul className="result-list">
            {skillNames.map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}
          </ul>
        ) : (
          <p className="muted">暂无已学武学。</p>
        )}
      </section>
    </section>
  )
}
