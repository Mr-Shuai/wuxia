import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusPanel from './StatusPanel'
import { createGameState } from '../game/engine/createGameState'

describe('StatusPanel', () => {
  it('shows grouped resources, journey stats, and carry summary', () => {
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

    render(<StatusPanel state={state} />)

    expect(screen.getByText('当前状态')).toBeInTheDocument()
    expect(screen.getByText('核心气血')).toBeInTheDocument()
    expect(screen.getByText('江湖阅历')).toBeInTheDocument()

    const resources = screen.getByLabelText('核心资源')
    expect(within(resources).getByText('生命')).toBeInTheDocument()
    expect(within(resources).getByText('18/28')).toBeInTheDocument()
    expect(within(resources).getByText('气')).toBeInTheDocument()
    expect(within(resources).getByText('9/14')).toBeInTheDocument()
    expect(within(resources).getByText('势')).toBeInTheDocument()
    expect(within(resources).getByText('7/11')).toBeInTheDocument()

    const journey = screen.getByLabelText('江湖阅历')
    expect(within(journey).getByText('侠义')).toBeInTheDocument()
    const moralityTile = within(journey).getByText('侠义').closest('div')
    const wantedTile = within(journey).getByText('通缉').closest('div')

    expect(moralityTile).not.toBeNull()
    expect(wantedTile).not.toBeNull()
    expect(within(moralityTile as HTMLElement).getByText('3')).toBeInTheDocument()
    expect(within(wantedTile as HTMLElement).getByText('1')).toBeInTheDocument()

    const summary = screen.getByText('随身摘要').closest('section')
    expect(summary).not.toBeNull()
    expect(within(summary as HTMLElement).getByText('当前兵刃')).toBeInTheDocument()
    expect(within(summary as HTMLElement).getByText('旧铁剑')).toBeInTheDocument()
    expect(within(summary as HTMLElement).getByText('当前招式')).toBeInTheDocument()
    expect(within(summary as HTMLElement).getByText('踏栈步')).toBeInTheDocument()
  })
})
