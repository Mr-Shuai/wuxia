import { describe, expect, it } from 'vitest'
import { explorationMaps } from '../data/explorationMaps'
import { createGameState } from './createGameState'
import {
  applyExplorationAction,
  applyMapNodeAction,
  enterExplorationMap,
  leaveExplorationMap,
} from './explorationEngine'

describe('explorationEngine', () => {
  it('defines the fixed exploration map data for X11M, X20M, and X100M', () => {
    const { X11M, X20M, X100M } = explorationMaps

    expect(X11M.id).toBe('X11M')
    expect(X11M.returnNodeId).toBe('N11')
    expect(X11M.nodes.map((node) => node.id)).toEqual([
      'storyteller-corner',
      'cross-beam-training',
      'inn-counter-shop',
      'porter-errand',
      'return-to-mainline',
    ])
    expect(X11M.nodes.map((node) => node.type)).toEqual([
      'intel',
      'training',
      'shop',
      'sidequest',
      'exit',
    ])

    const x11TrainingNode = X11M.nodes.find((node) => node.type === 'training')
    expect(x11TrainingNode?.reward?.martialSkillId).toBe('swallow-step')

    const x11ShopNode = X11M.nodes.find((node) => node.type === 'shop')
    expect(x11ShopNode?.shopItems?.[0]?.id).toBe('healing-salve')
    expect(x11ShopNode?.shopItems?.[0]?.reward.itemId).toBe('healing-salve')

    const x20IntelNode = X20M.nodes.find((node) => node.type === 'intel')
    const x20TrainingNode = X20M.nodes.find((node) => node.type === 'training')

    expect(X20M.returnNodeId).toBe('N20')
    expect(x20IntelNode?.reward?.weaponId).toBe('black-sheath-dagger')
    expect(x20TrainingNode?.reward?.martialSkillId).toBe('reed-step')

    const x100IntelNode = X100M.nodes.find((node) => node.type === 'intel')
    const x100TrainingNode = X100M.nodes.find((node) => node.type === 'training')

    expect(X100M.nodes.some((node) => node.type === 'shop')).toBe(true)
    expect(x100IntelNode?.reward?.weaponId).toBe('salt-inspector-ruler')
    expect(x100TrainingNode?.reward?.martialSkillId).toBe('catwalk-step')

    expect(
      [X11M, X20M, X100M].every((map) =>
        map.nodes.some(
          (node) => node.type === 'exit' && node.id === 'return-to-mainline',
        ),
      ),
    ).toBe(true)
  })

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

  it('enters a map without moving the mainline current node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    const entered = enterExplorationMap(state, 'X11M')

    expect(entered.currentExplorationMapId).toBe('X11M')
    expect(entered.explorationReturnNodeId).toBe('N11')
    expect(entered.currentNodeId).toBe(state.currentNodeId)
  })

  it('throws when applying a map node action before entering the map', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    expect(() => applyMapNodeAction(state, 'X11M', 'storyteller-corner')).toThrowError(
      'No active exploration map. Expected X11M.',
    )
  })

  it('throws when applying a map node action for a different active map', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    const entered = enterExplorationMap(state, 'X11M')

    expect(() => applyMapNodeAction(entered, 'X20M', 'reed-training')).toThrowError(
      'Active exploration map mismatch: expected X11M, got X20M',
    )
  })

  it('applies shop actions inside a map without returning to mainline', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    const entered = enterExplorationMap(state, 'X11M')
    const next = applyMapNodeAction(entered, 'X11M', 'inn-counter-shop', 'healing-salve')

    expect(next.silver).toBe(8)
    expect(next.inventory).toContain('healing-salve')
    expect(next.currentExplorationMapId).toBe('X11M')
    expect(next.currentNodeId).toBe(state.currentNodeId)
  })

  it('learns a training node only once and returns the same object on repeat', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    const entered = enterExplorationMap(state, 'X20M')
    const first = applyMapNodeAction(entered, 'X20M', 'reed-training')
    const second = applyMapNodeAction(first, 'X20M', 'reed-training')

    expect(first.martialSkills.filter((id) => id === 'reed-step')).toHaveLength(1)
    expect(second.martialSkills.filter((id) => id === 'reed-step')).toHaveLength(1)
    expect(second).toBe(first)
  })

  it('completes a sidequest inside a map and keeps the player on that map', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    const entered = enterExplorationMap(state, 'X100M')
    const next = applyMapNodeAction(entered, 'X100M', 'dockworker-clue')

    expect(next.completedSideQuests).toContain('wharf-dockworker-clue')
    expect(next.currentExplorationMapId).toBe('X100M')
    expect(next.chapterLogs[next.chapterLogs.length - 1]).toBe(
      explorationMaps.X100M.nodes.find((node) => node.id === 'dockworker-clue')?.quest?.log,
    )
  })

  it('leaves a map by clearing exploration state and returning to the mapped story node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    const entered = enterExplorationMap(state, 'X100M')
    const left = leaveExplorationMap(entered)

    expect(left.currentExplorationMapId).toBeUndefined()
    expect(left.explorationReturnNodeId).toBeUndefined()
    expect(left.currentNodeId).toBe('N110')
  })
})
