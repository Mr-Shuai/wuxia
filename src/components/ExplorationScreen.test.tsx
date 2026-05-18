import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { explorationMaps } from '../game/data/explorationMaps'
import { createGameState } from '../game/engine/createGameState'
import ExplorationScreen from './ExplorationScreen'

function getExplorationActionButton(text: string) {
  return screen.getByRole('button', { name: new RegExp(text) })
}

describe('ExplorationScreen', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps exploration node hover transform fixed in the stylesheet override', () => {
    const user = userEvent.setup()
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })

    render(
      <ExplorationScreen
        state={state}
        map={explorationMaps.X11M}
        onNodeAction={() => undefined}
      />,
    )

    const shopNodeButton = screen.getByRole('button', { name: '掌柜小铺' })

    expect(shopNodeButton).toHaveStyle({ transform: 'translate(-50%, -50%)' })

    return user.hover(shopNodeButton).then(() => {
      expect(shopNodeButton).toHaveStyle({ transform: 'translate(-50%, -50%)' })
    })
  })

  it('renders a graphical route board and invokes node actions', async () => {
    const user = userEvent.setup()
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })
    state.silver = 12
    state.currentExplorationMapId = 'X11M'
    state.explorationReturnNodeId = 'N11'
    const calls: Array<{ nodeId: string; shopItemId?: string }> = []

    render(
      <ExplorationScreen
        state={state}
        map={explorationMaps.X11M}
        onNodeAction={(nodeId, shopItemId) => calls.push({ nodeId, shopItemId })}
      />,
    )

    expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
    const routeBoard = screen.getByRole('region', { name: '探索路径图' })
    expect(routeBoard).toBeInTheDocument()
    expect(within(routeBoard).getAllByRole('button')).toHaveLength(5)
    expect(within(routeBoard).queryByText('落点预览')).not.toBeInTheDocument()
    const shopNodeButton = screen.getByRole('button', { name: '掌柜小铺' })
    const trainingNodeButton = screen.getByRole('button', { name: '横梁试步' })
    const exitNodeButton = screen.getByRole('button', { name: '收束行程' })
    expect(shopNodeButton).toBeInTheDocument()
    expect(trainingNodeButton).toBeInTheDocument()
    expect(exitNodeButton).toBeInTheDocument()
    expect(screen.getByText('节点详情')).toBeInTheDocument()

    await user.hover(shopNodeButton)

    expect(within(routeBoard).getByText('落点预览')).toBeInTheDocument()
    expect(within(routeBoard).getByText('可采购 2 项 · 2-4 两')).toBeInTheDocument()

    await user.unhover(shopNodeButton)

    expect(within(routeBoard).queryByText('落点预览')).not.toBeInTheDocument()

    await user.click(shopNodeButton)

    expect(screen.getByText('金创药')).toBeInTheDocument()
    expect(screen.getByText('4 两')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '购买 金创药' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '购买 金创药' }))

    expect(calls).toEqual([{ nodeId: 'inn-counter-shop', shopItemId: 'healing-salve' }])

    await user.hover(exitNodeButton)

    expect(within(routeBoard).getByText('返回主线，收束本次自由探索。')).toBeInTheDocument()

    await user.unhover(exitNodeButton)

    expect(within(routeBoard).queryByText('返回主线，收束本次自由探索。')).not.toBeInTheDocument()

    await user.click(exitNodeButton)

    expect(screen.getByRole('button', { name: '结束探索并返回主线' })).toBeInTheDocument()
  })

  it('disables detail actions while exploration narration is streaming', async () => {
    const user = userEvent.setup()
    const state = createGameState({
      name: '阿青',
      originId: 'wanderer',
      talentId: 'steady-heart',
    })
    state.silver = 12
    state.currentExplorationMapId = 'X11M'
    state.explorationReturnNodeId = 'N11'
    const calls: Array<{ nodeId: string; shopItemId?: string }> = []

    render(
      <ExplorationScreen
        state={state}
        map={explorationMaps.X11M}
        onNodeAction={(nodeId, shopItemId) => calls.push({ nodeId, shopItemId })}
        inlineResult={{
          text: '你刚得到一条新线索。',
          recentLogs: ['你刚得到一条新线索。'],
          streaming: true,
        }}
        disableChoices
      />,
    )

    await user.click(screen.getByRole('button', { name: '掌柜小铺' }))

    expect(screen.getByRole('button', { name: '购买 金创药' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '横梁试步' }))
    expect(screen.getByRole('button', { name: '试步习得' })).toBeDisabled()

    expect(calls).toEqual([])
  })

  it('reaches map exploration before N11 and returns to story only after the manual exit action', async () => {
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
      expect(screen.getByText('探索 · X11M')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
      expect(screen.getAllByText('你把残篇交还，换来一份信任，也让自己站到了更亮的地方。').length).toBeGreaterThan(0)
      expect(screen.getByText('节点详情')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(getExplorationActionButton('脚夫求助')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('脚夫求助'))
    await user.click(screen.getByRole('button', { name: '了结此事' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X11M')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '酒楼暗查图' })).toBeInTheDocument()
      expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
    })

    await user.click(getExplorationActionButton('收束行程'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '结束探索并返回主线' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '结束探索并返回主线' }))

    await waitFor(() => {
      expect(screen.getByText(/^N11$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '当众比武定是非' })).toBeEnabled()
    })

    expect(screen.getByText(/^N11$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '酒楼听风' })).toBeInTheDocument()
    expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
  })
})
