import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'

describe('createGameState', () => {
  it('creates a new game from origin and talent bonuses', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    expect(state.name).toBe('阿青')
    expect(state.origin).toBe('wanderer')
    expect(state.talent).toBe('steady-heart')
    expect(state.currentNodeId).toBe('N00')
    expect(state.maxHp).toBeGreaterThan(0)
    expect(state.maxQi).toBeGreaterThan(0)
    expect(state.flags.savedSpy).toBe(false)
  })

  it('initializes exploration, martial skill, and weapon state fields', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    expect(state.inventory).toEqual([])
    expect(state.martialSkills).toEqual([])
    expect(state.exploredScenes).toEqual([])
    expect(state.activeWeaponId).toBeUndefined()
  })

  it('initializes silver and free exploration state fields', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    expect(state.silver).toBe(12)
    expect(state.currentExplorationMapId).toBeUndefined()
    expect(state.explorationReturnNodeId).toBeUndefined()
    expect(state.completedMapNodes).toEqual([])
    expect(state.purchasedShopItems).toEqual([])
    expect(state.completedSideQuests).toEqual([])
  })
})
