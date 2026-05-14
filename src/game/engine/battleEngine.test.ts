import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { createBattleState, runBattleTurn } from './battleEngine'

describe('battleEngine', () => {
  it('adds weapon and martial bonuses to the starting player battle state', () => {
    const player = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    player.activeWeaponId = 'old-iron-sword'
    player.inventory.push('old-iron-sword')
    player.martialSkills.push('reed-step', 'swallow-step')

    const battle = createBattleState(player, 'guard-skirmish')

    expect(battle.player.attack).toBe(player.attack + 2)
    expect(battle.player.maxPoise).toBe(player.maxPoise + 1)
    expect(battle.player.poise).toBe(player.poise + 1)
  })

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

  it('creates the new night raid battle for late mainline chapters', () => {
    const player = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    const battle = createBattleState(player, 'night-raid-captain')

    expect(battle.title).toBe('渡口夜战')
    expect(battle.enemy.name).toBe('夜袭统领')
    expect(battle.outcome).toBe('ongoing')
  })
})
