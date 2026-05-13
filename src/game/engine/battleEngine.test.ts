import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { createBattleState, runBattleTurn } from './battleEngine'

describe('battleEngine', () => {
  it('reduces enemy poise and hp on attack', () => {
    const player = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    const battle = createBattleState(player, 'bandit-ambush')
    const next = runBattleTurn(battle, 'attack')

    expect(next.enemy.hp).toBeLessThan(battle.enemy.hp)
    expect(next.enemy.poise).toBeLessThan(battle.enemy.poise)
  })

  it('spends qi on break action', () => {
    const player = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    const battle = createBattleState(player, 'bandit-ambush')
    battle.enemy.poise = 0

    const next = runBattleTurn(battle, 'break')
    expect(next.player.qi).toBeLessThan(battle.player.qi)
  })
})
