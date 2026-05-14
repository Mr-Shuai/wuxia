import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { applyExplorationAction } from './explorationEngine'

describe('explorationEngine', () => {
  it('grants a weapon and marks the scene as explored', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    const next = applyExplorationAction(state, 'X11', 'search-kitchen-cache')

    expect(next.activeWeaponId).toBe('old-iron-sword')
    expect(next.inventory).toContain('old-iron-sword')
    expect(next.exploredScenes).toContain('X11:search-kitchen-cache')
  })

  it('grants a martial skill from exploration only once when action repeats', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    const first = applyExplorationAction(state, 'X20', 'trace-reeds-footwork')
    const second = applyExplorationAction(first, 'X20', 'trace-reeds-footwork')

    expect(first.martialSkills).toContain('reed-step')
    expect(first.chapterLogs[first.chapterLogs.length - 1]).toBe('你踩着浅滩与碎桩一遍遍试步，终于摸到了一套能在湿滑岸边借力的法门。')
    expect(second.martialSkills.filter((id) => id === 'reed-step')).toHaveLength(1)
    expect(second.chapterLogs).toHaveLength(first.chapterLogs.length)
    expect(second.chapterLogs).toEqual(first.chapterLogs)
    expect(second).toBe(first)
  })

  it('grants the southern righteous exploration rewards and returns to N110', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    const weaponRoute = applyExplorationAction(state, 'X100', 'search-inspector-room')
    const skillRoute = applyExplorationAction(state, 'X100', 'catwalk-footwork')

    expect(weaponRoute.activeWeaponId).toBe('salt-inspector-ruler')
    expect(weaponRoute.inventory).toContain('salt-inspector-ruler')
    expect(weaponRoute.currentNodeId).toBe('N110')

    expect(skillRoute.martialSkills).toContain('catwalk-step')
    expect(skillRoute.currentNodeId).toBe('N110')
  })
})
