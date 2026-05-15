import { martialSkills } from '../game/data/martialSkills'
import { weapons } from '../game/data/weapons'
import type { GameState } from '../game/types'

interface StatusOverviewPanelProps {
  state: GameState
}

export default function StatusOverviewPanel({ state }: StatusOverviewPanelProps) {
  const equippedWeapon = state.activeWeaponId ? weapons[state.activeWeaponId]?.name ?? state.activeWeaponId : '无'
  const learnedSkills = state.martialSkills.length > 0
    ? state.martialSkills.map((skillId) => martialSkills[skillId]?.name ?? skillId).join('、')
    : '暂无已学武学'

  return (
    <section className="game-overlay-section-grid status-overview-panel">
      <section className="game-overlay-card game-overlay-card-highlight">
        <p className="eyebrow">状态</p>
        <h3>核心资源</h3>
        <dl className="status-grid">
          <div className="status-stat-tile"><dt>生命</dt><dd>{state.hp}/{state.maxHp}</dd></div>
          <div className="status-stat-tile"><dt>气</dt><dd>{state.qi}/{state.maxQi}</dd></div>
          <div className="status-stat-tile"><dt>势</dt><dd>{state.poise}/{state.maxPoise}</dd></div>
        </dl>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">状态</p>
        <h3>江湖阅历</h3>
        <dl className="status-grid">
          <div className="status-stat-tile"><dt>侠义</dt><dd>{state.morality}</dd></div>
          <div className="status-stat-tile"><dt>通缉</dt><dd>{state.wantedLevel}</dd></div>
          <div className="status-stat-tile"><dt>名望</dt><dd>{state.reputation}</dd></div>
          <div className="status-stat-tile"><dt>人情债</dt><dd>{state.debt}</dd></div>
        </dl>
      </section>

      <section className="game-overlay-card">
        <p className="eyebrow">状态</p>
        <h3>当前配置</h3>
        <div className="story-summary-row">
          <span className="story-summary-label">当前兵刃</span>
          <strong>{equippedWeapon}</strong>
        </div>
        <div className="story-summary-row">
          <span className="story-summary-label">已学武学</span>
          <strong>{learnedSkills}</strong>
        </div>
      </section>
    </section>
  )
}
