import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { applyChoice, resolveEnding } from './storyEngine'

describe('storyEngine', () => {
  it('applies N00 rescue choice and advances to N10', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    const next = applyChoice(state, 'N00', 'rescue-spy')

    expect(next.currentNodeId).toBe('N10')
    expect(next.flags.savedSpy).toBe(true)
    expect(next.debt).toBe(1)
  })

  it('resolves righteous ending when morality is high', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.morality = 2
    state.reputation = 2

    expect(resolveEnding(state).id).toBe('E01')
  })

  it('advances from N11 negotiation path into N12 instead of ending immediately', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N11'

    const next = applyChoice(state, 'N11', 'trade-info')

    expect(next.currentNodeId).toBe('N12')
    expect(next.debt).toBe(1)
  })
})
