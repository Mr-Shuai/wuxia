import { describe, expect, it } from 'vitest'
import { createGameState } from './createGameState'
import { applyChoice, isChoiceAvailable, resolveEnding } from './storyEngine'
import { storyNodes } from '../data/story'

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

  it('shows the N11 beam shadow route choice when swallow-step exists', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N11'
    state.martialSkills.push('swallow-step')

    const choice = storyNodes.N11.choices.find((item) => item.id === 'beam-shadow-route')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('advances from N12 sword sect path into the new mainline chapter', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N12'

    const next = applyChoice(state, 'N12', 'join-sword-sect')

    expect(next.currentNodeId).toBe('N20')
    expect(next.favorSword).toBe(2)
    expect(next.reputation).toBe(1)
  })

  it('advances from N21 expose-ledger path into the new showdown chapter', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N21'

    const next = applyChoice(state, 'N21', 'expose-ledger')

    expect(next.currentNodeId).toBe('N30')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('shows the N20 dagger threat choice when black-sheath-dagger exists', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N20'
    state.inventory.push('black-sheath-dagger')

    const choice = storyNodes.N20.choices.find((item) => item.id === 'threaten-boatman-with-dagger')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('shows the N110 catwalk route choice when catwalk-step exists', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N110'
    state.martialSkills.push('catwalk-step')

    const choice = storyNodes.N110.choices.find((item) => item.id === 'cut-signal-from-catwalk')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('hides the N110 catwalk route choice when catwalk-step is missing', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N110'

    const choice = storyNodes.N110.choices.find((item) => item.id === 'cut-signal-from-catwalk')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(false)
  })

  it('routes the secret-line verdict into N40 from N31 and records the route flag', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N31'
    state.flags.savedSpy = true
    state.debt = 2

    const next = applyChoice(state, 'N31', 'fade-into-secret-line')

    expect(next.currentNodeId).toBe('N40')
    expect(next.debt).toBe(3)
    expect(next.flags.savedSpy).toBe(true)
    expect(next.flags.choseSecretVerdict).toBe(true)
  })

  it('rejects the secret-line finale choice when the spy was never saved', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N31'
    state.flags.savedSpy = false
    state.debt = 2

    expect(() => applyChoice(state, 'N31', 'fade-into-secret-line')).toThrow('Choice not available')
  })

  it('shows an extra righteous verdict option at N31 after winning the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N31'
    state.flags.wonNightRaid = true
    state.flags.lostNightRaid = false

    const choice = storyNodes.N31.choices.find((item) => item.id === 'call-out-mastermind')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('hides the righteous verdict option at N31 after losing the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N31'
    state.flags.lostNightRaid = true

    const choice = storyNodes.N31.choices.find((item) => item.id === 'hand-to-righteous')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(false)
  })

  it('shows a defeat-only black market option at N31 after losing the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N31'
    state.flags.lostNightRaid = true

    const choice = storyNodes.N31.choices.find((item) => item.id === 'sell-out-under-pressure')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('hides the defeat-only black market option at N31 after winning the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N31'
    state.flags.wonNightRaid = true
    state.flags.lostNightRaid = false

    const choice = storyNodes.N31.choices.find((item) => item.id === 'sell-out-under-pressure')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(false)
  })

  it('shows a victory-only secret-line option at N31 after winning the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N31'
    state.flags.savedSpy = true
    state.flags.wonNightRaid = true
    state.flags.lostNightRaid = false
    state.debt = 2

    const choice = storyNodes.N31.choices.find((item) => item.id === 'mask-the-exit')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('shows a special neutral option at N31 after winning the night raid battle', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N31'
    state.flags.wonNightRaid = true
    state.flags.lostNightRaid = false

    const choice = storyNodes.N31.choices.find((item) => item.id === 'walk-away-after-victory')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('advances from N31 righteous route into N40 and records the route flag', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N31'
    state.flags.wonNightRaid = true
    state.flags.lostNightRaid = false

    const next = applyChoice(state, 'N31', 'call-out-mastermind')

    expect(next.currentNodeId).toBe('N40')
    expect(next.flags.choseRighteousVerdict).toBe(true)
  })

  it('shows the righteous continuation option at N40 after taking the righteous route', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N40'
    state.flags.choseRighteousVerdict = true

    const choice = storyNodes.N40.choices.find((item) => item.id === 'enter-capital-as-witness')

    expect(choice).toBeDefined()
    expect(isChoiceAvailable(state, choice!)).toBe(true)
  })

  it('advances from N40 righteous route into the capital chapter node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N40'
    state.flags.choseRighteousVerdict = true

    const next = applyChoice(state, 'N40', 'enter-capital-as-witness')

    expect(next.currentNodeId).toBe('N50')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('routes the capital hearing route from N50 into the next righteous chapter node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N50'

    const next = applyChoice(state, 'N50', 'strike-drum-at-dawn')

    expect(next.currentNodeId).toBe('N60')
    expect(next.morality).toBe(1)
    expect(next.favorSword).toBe(1)
  })

  it('routes the righteous court-pressure route from N60 into the third chapter node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N60'

    const next = applyChoice(state, 'N60', 'summon-sect-allies')

    expect(next.currentNodeId).toBe('N70')
    expect(next.reputation).toBe(2)
    expect(next.favorSword).toBe(1)
  })

  it('routes the righteous third-chapter node from N70 into the final pre-ending node', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N70'

    const next = applyChoice(state, 'N70', 'escort-memorial-into-hall')

    expect(next.currentNodeId).toBe('N80')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('resolves the righteous final pre-ending node from N80 into E01', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N80'

    const next = applyChoice(state, 'N80', 'name-the-mastermind-before-all')

    expect(next.currentNodeId).toBe('E01')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(2)
  })

  it('resolves the righteous epilogue node from N90 into the true final ending', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N90'

    const next = applyChoice(state, 'N90', 'leave-capital-under-clear-skies')

    expect(next.currentNodeId).toBe('F01')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('routes the righteous post-ending continuation from N100 into the new southern ending', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N100'

    const next = applyChoice(state, 'N100', 'escort-censor-south')

    expect(next.currentNodeId).toBe('N110')
    expect(next.morality).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('routes the new righteous southern showdown from N110 into G01', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N110'
    state.martialSkills.push('catwalk-step')

    const next = applyChoice(state, 'N110', 'cut-signal-from-catwalk')

    expect(next.currentNodeId).toBe('G01')
    expect(next.reputation).toBe(2)
    expect(next.favorSword).toBe(1)
  })

  it('routes the black-market continuation from N101 into the new southern ending', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N101'

    const next = applyChoice(state, 'N101', 'buy-the-southern-route')

    expect(next.currentNodeId).toBe('G02')
    expect(next.favorBlackMarket).toBe(2)
    expect(next.debt).toBe(1)
  })

  it('routes the secret-line continuation from N102 into the new southern ending', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'scholar',
      talentId: 'keen-eye',
    })

    state.currentNodeId = 'N102'

    const next = applyChoice(state, 'N102', 'restart-the-south-lantern-line')

    expect(next.currentNodeId).toBe('G04')
    expect(next.debt).toBe(1)
    expect(next.reputation).toBe(1)
  })

  it('routes the neutral continuation from N103 into the new southern ending', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.currentNodeId = 'N103'

    const next = applyChoice(state, 'N103', 'board-the-tide-and-watch')

    expect(next.currentNodeId).toBe('G03')
    expect(next.reputation).toBe(1)
  })
})
