import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusPanel from './StatusPanel'
import { createGameState } from '../game/engine/createGameState'

describe('StatusPanel', () => {
  it('keeps only the compact core resources needed during the mainline flow', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    state.hp = 18
    state.maxHp = 28
    state.qi = 9
    state.maxQi = 14
    state.poise = 7
    state.maxPoise = 11
    state.morality = 3
    state.wantedLevel = 1
    state.reputation = 5
    state.debt = 2
    state.activeWeaponId = 'old-iron-sword'
    state.inventory.push('old-iron-sword')
    state.martialSkills.push('catwalk-step')
    state.exploredScenes.push('X11:search-kitchen-cache')

    render(<StatusPanel state={state} compact />)

    expect(screen.getByText('当前状态')).toBeInTheDocument()
    expect(screen.getByText('核心气血')).toBeInTheDocument()
    expect(screen.queryByText('江湖阅历')).not.toBeInTheDocument()
    expect(screen.queryByText('随身摘要')).not.toBeInTheDocument()

    const resources = screen.getByLabelText('核心资源')
    expect(within(resources).getByText('生命')).toBeInTheDocument()
    expect(within(resources).getByText('18/28')).toBeInTheDocument()
    expect(within(resources).getByText('气')).toBeInTheDocument()
    expect(within(resources).getByText('9/14')).toBeInTheDocument()
    expect(within(resources).getByText('势')).toBeInTheDocument()
    expect(within(resources).getByText('7/11')).toBeInTheDocument()
  })
})
