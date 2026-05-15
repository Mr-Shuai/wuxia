import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { explorationScenes } from '../game/data/exploration'
import { createGameState } from '../game/engine/createGameState'
import ExplorationScreen from './ExplorationScreen'

function getExplorationActionButton(text: string) {
  return screen.getByRole('button', { name: new RegExp(text) })
}

describe('ExplorationScreen', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders scene actions and invokes onChoose', async () => {
    const user = userEvent.setup()
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })
    const calls: string[] = []

    render(
      <ExplorationScreen
        state={state}
        scene={explorationScenes.X11}
        onChoose={(action) => calls.push(action.id)}
      />,
    )

    expect(screen.getByText('探索 · X11')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '酒楼暗查' })).toBeInTheDocument()
    expect(screen.queryByText('现场速览')).not.toBeInTheDocument()
    expect(screen.queryByText('可行动作 2')).not.toBeInTheDocument()
    expect(screen.queryByText('完成后回到主线')).not.toBeInTheDocument()
    expect(screen.queryByText('随身摘要')).not.toBeInTheDocument()
    expect(screen.getByText('可能获得兵刃')).toBeInTheDocument()
    expect(screen.getByText('可能悟出轻身法门')).toBeInTheDocument()

    await user.click(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器'))

    expect(calls).toEqual(['search-kitchen-cache'])
  })

  it('reaches exploration before N11 and returns to story without switching to result screen', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '江湖浪客' }))
    await user.click(screen.getByRole('button', { name: '稳心' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    await user.click(screen.getByRole('button', { name: '收留并救治密探' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '把残篇交回镖局' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '把残篇交回镖局' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X11')).toBeInTheDocument()
      expect(screen.getAllByText('你把残篇交还，换来一份信任，也让自己站到了更亮的地方。').length).toBeGreaterThan(0)
      expect(screen.queryByText('现场速览')).not.toBeInTheDocument()
      expect(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器')).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: '酒楼暗查' })).toBeInTheDocument()
    expect(screen.queryByText('章节结算')).not.toBeInTheDocument()

    await user.click(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器'))

    await waitFor(() => {
      expect(screen.getByText(/^N11$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '当众比武定是非' })).toBeEnabled()
    })

    expect(screen.getByText(/^N11$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '酒楼听风' })).toBeInTheDocument()
    expect(screen.queryByText('当前兵刃')).not.toBeInTheDocument()
    expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
  })
})
