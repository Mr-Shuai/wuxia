import { render, screen } from '@testing-library/react'
import BattleScreen from './BattleScreen'
import type { BattleState } from '../game/types'

function createBattleState(overrides?: Partial<BattleState>): BattleState {
  return {
    player: {
      hp: 22,
      qi: 6,
      poise: 7,
      attack: 8,
      defense: 4,
      maxHp: 30,
      maxQi: 10,
      maxPoise: 10,
    },
    enemy: {
      id: 'bandit',
      name: '拦路匪徒',
      hp: 12,
      qi: 4,
      poise: 0,
      attack: 7,
      defense: 2,
    },
    log: ['拦路匪徒 挡在了你的去路。', '你抓住破绽，一招破招直取中门。'],
    outcome: 'ongoing',
    ...overrides,
  }
}

describe('BattleScreen readability', () => {
  it('shows break recommendation when enemy poise is zero', () => {
    render(<BattleScreen battle={createBattleState()} onAction={() => {}} />)

    expect(screen.getAllByText('破绽中').length).toBeGreaterThan(0)
    expect(screen.getByText('敌方势已崩，正是破招的最好时机。')).toBeInTheDocument()
    expect(screen.getByText('推荐')).toBeInTheDocument()
    expect(screen.getByText('对破绽敌人收益最高')).toBeInTheDocument()
  })

  it('prioritizes danger hint over low qi hint for the player', () => {
    render(
      <BattleScreen
        battle={createBattleState({
          player: {
            hp: 8,
            qi: 2,
            poise: 3,
            attack: 8,
            defense: 4,
            maxHp: 30,
            maxQi: 10,
            maxPoise: 10,
          },
          enemy: {
            id: 'guard',
            name: '酒楼护卫',
            hp: 18,
            qi: 6,
            poise: 8,
            attack: 8,
            defense: 3,
          },
        })}
        onAction={() => {}}
      />,
    )

    expect(screen.getByText('危险')).toBeInTheDocument()
    expect(screen.getByText('气不足')).toBeInTheDocument()
    expect(screen.getByText('你已陷入危险，优先防守会更稳。')).toBeInTheDocument()
  })
})
