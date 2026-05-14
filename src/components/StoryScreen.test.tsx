import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StoryScreen from './StoryScreen'
import { createGameState } from '../game/engine/createGameState'

describe('StoryScreen', () => {
  it('shows a clearer mainline progression overview and richer action cards', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N110'
    state.visitedNodes = ['N00', 'N10', 'N11', 'N12', 'N20', 'N21', 'N30', 'N31', 'N40', 'N50', 'N60', 'N70', 'N80', 'E01', 'N90', 'F01', 'N100', 'N110']
    state.chapterLogs = [
      '你护着巡按与口供一路南下。',
      '你在南仓摸清了册页藏处。',
      '你已逼近盐港外闸，只差最后一手。',
    ]
    state.reputation = 4
    state.morality = 3
    state.activeWeaponId = 'salt-inspector-ruler'
    state.inventory.push('salt-inspector-ruler')
    state.martialSkills.push('catwalk-step')

    render(<StoryScreen state={state} onChoose={() => {}} />)

    expect(screen.getByText('主线推进中')).toBeInTheDocument()
    expect(screen.getByText('推进概览')).toBeInTheDocument()
    expect(screen.getByText('最近动向')).toBeInTheDocument()
    expect(screen.getByText('行动抉择')).toBeInTheDocument()

    const summaryCard = screen.getAllByText('随身摘要')[0].closest('section')

    expect(summaryCard).not.toBeNull()
    expect(within(summaryCard as HTMLElement).getByText('携带兵刃')).toBeInTheDocument()
    expect(within(summaryCard as HTMLElement).getByText('巡盐铁尺')).toBeInTheDocument()
    expect(within(summaryCard as HTMLElement).getByText('已会招式')).toBeInTheDocument()
    expect(within(summaryCard as HTMLElement).getByText('踏栈步')).toBeInTheDocument()

    const catwalkAction = screen.getByRole('button', { name: '借踏栈步先翻上吊脚廊桥，从高处断掉盐港传讯退路' })
    const actionCard = catwalkAction.closest('button')

    expect(actionCard).not.toBeNull()
    expect(within(actionCard as HTMLButtonElement).getByText('推进至 G01')).toBeInTheDocument()
    expect(within(actionCard as HTMLButtonElement).getByText('战斗')).toBeInTheDocument()
    expect(within(actionCard as HTMLButtonElement).getByText('需踏栈步')).toBeInTheDocument()
  })

  it('hides recent logs when inline echo is visible so the page keeps one narrative focus', () => {
    const state = createGameState({
      name: '阿青',
      originId: 'escort',
      talentId: 'iron-bone',
    })

    state.currentNodeId = 'N11'
    state.visitedNodes = ['N00', 'N10', 'N11']
    state.chapterLogs = [
      '你冒雨生火，为密探止了血，也欠下了一段人情。',
      '你把残篇交还，换来一份信任，也让自己站到了更亮的地方。',
      '你在灶台后的暗格里摸到一柄旧铁剑，剑虽旧，却正合手。',
    ]

    render(
      <StoryScreen
        state={state}
        onChoose={() => {}}
        inlineResult={{
          text: '你在灶台后的暗格里摸到一柄旧铁剑，剑虽旧，却正合手。',
          recentLogs: state.chapterLogs,
          streaming: false,
        }}
      />, 
    )

    expect(screen.getByText('江湖回声')).toBeInTheDocument()
    expect(screen.getByText('先看清这一手落下后，局面到底变了什么')).toBeInTheDocument()
    expect(screen.queryByText('最近动向')).not.toBeInTheDocument()
  })
})
