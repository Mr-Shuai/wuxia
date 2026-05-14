import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { createGameState } from './game/engine/createGameState'

function getExplorationActionButton(text: string) {
  return screen.getByRole('button', { name: new RegExp(text) })
}

function seedGameAtNode(nodeId: string) {
  const gameState = createGameState({
    name: '阿青',
    originId: 'escort',
    talentId: 'iron-bone',
  })

  gameState.currentNodeId = nodeId
  gameState.visitedNodes = ['N00', 'N10', 'N11', 'N12', 'N20', 'N21', nodeId]
  gameState.flags.savedSpy = true
  gameState.debt = 2

  window.localStorage.setItem('wuxia-save', JSON.stringify({ gameState }))
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('plays through start to first story node', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '江湖浪客' }))
    await user.click(screen.getByRole('button', { name: '稳心' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    expect(screen.getByText(/^N00$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '破庙夜雨' })).toBeInTheDocument()
  })

  it('saves progress after character creation', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '江湖浪客' }))
    await user.click(screen.getByRole('button', { name: '稳心' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    expect(window.localStorage.getItem('wuxia-save')).toContain('N00')
  })

  it('plays an expanded non-battle route from N12 through chapter summary into the true righteous ending', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '破落书生' }))
    await user.click(screen.getByRole('button', { name: '听风' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    await user.click(screen.getByRole('button', { name: '收留并救治密探' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '把残篇交回镖局' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '把残篇交回镖局' }))

    expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('探索 · X11')).toBeInTheDocument()
      expect(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器'))

    await waitFor(() => {
      expect(screen.getByText(/^N11$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '谈判交换情报' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '谈判交换情报' }))

    expect(screen.getByText(/^N12$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '山门试剑' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '入清正剑宗，换一条正路' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '入清正剑宗，换一条正路' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X20')).toBeInTheDocument()
      expect(getExplorationActionButton('翻查黑船边角货箱，看看有没有顺手兵刃')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('翻查黑船边角货箱，看看有没有顺手兵刃'))

    await waitFor(() => {
      expect(screen.getByText(/^N20$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '护住人证与账册，走明路过江' })).toBeEnabled()
    })

    expect(screen.getByText(/^N20$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '寒江渡口' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '护住人证与账册，走明路过江' }))

    expect(screen.getByText(/^N21$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '藏经阁火光' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '公开账册，逼幕后之人现身' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '公开账册，逼幕后之人现身' }))

    expect(screen.getByText(/^N30$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '渡口夜战' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '斩断锚链，先保住人证与退路' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '斩断锚链，先保住人证与退路' }))

    await waitFor(() => {
      expect(screen.getByText(/^N31$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '当众交证，让清流接手此案' })).toBeEnabled()
    })

    expect(screen.getByText(/^N31$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '白堤裁断' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '当众交证，让清流接手此案' }))

    await waitFor(() => {
      expect(screen.getByText(/^N40$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '带着人证入京，把案子送上更高处' })).toBeEnabled()
    })

    expect(screen.getByText(/^N40$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '京华风起' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '带着人证入京，把案子送上更高处' }))

    await waitFor(() => {
      expect(screen.getByText(/^N50$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '天明击登闻鼓，把整桩案子送进朝堂' })).toBeEnabled()
    })

    expect(screen.getByText(/^N50$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '金台晨鼓' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '天明击登闻鼓，把整桩案子送进朝堂' }))

    await waitFor(() => {
      expect(screen.getByText(/^N60$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '联络剑宗与清流同上乌台，把主谋退路一并封死' })).toBeEnabled()
    })

    expect(screen.getByText(/^N60$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '乌台风压' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '联络剑宗与清流同上乌台，把主谋退路一并封死' }))

    await waitFor(() => {
      expect(screen.getByText(/^N70$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '护着奏疏与人证入殿，当廷把旧案钉死' })).toBeEnabled()
    })

    expect(screen.getByText(/^N70$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '丹陛回雪' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '护着奏疏与人证入殿，当廷把旧案钉死' }))

    await waitFor(() => {
      expect(screen.getByText(/^N80$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '当着满殿点出主谋与同党，把这场旧案彻底定名' })).toBeEnabled()
    })

    expect(screen.getByText(/^N80$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '九阙定声' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '当着满殿点出主谋与同党，把这场旧案彻底定名' }))

    expect(screen.getByText(/章节总结/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '正道倾向' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '继续前行' }))

    expect(screen.getByText(/^N90$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '天光出城' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '趁天光未散离京南下，把余生留给更广阔的江湖' }))

    expect(screen.getByText(/章节总结\s*·\s*F01/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '正道余响' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '南下追查' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '南下追查' }))

    expect(screen.getByText(/^N100$/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '江南急檄' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '护送巡按与口供南下，趁官路未断先夺回盐引旧册' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '护送巡按与口供南下，趁官路未断先夺回盐引旧册' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X100')).toBeInTheDocument()
      expect(getExplorationActionButton('沿潮湿高栈试步，记牢跨桥换位的落脚点')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('沿潮湿高栈试步，记牢跨桥换位的落脚点'))

    await waitFor(() => {
      expect(screen.getByText(/^N110$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '借踏栈步先翻上吊脚廊桥，从高处断掉盐港传讯退路' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '借踏栈步先翻上吊脚廊桥，从高处断掉盐港传讯退路' }))

    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^破招/ }))

    await waitFor(() => {
      expect(screen.getByText('战局已定')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '继续前行' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '继续前行' }))

    expect(screen.getByText(/终局\s*·\s*G01/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '潮上明锋' })).toBeInTheDocument()
  }, 15000)

  it('hides the secret-line ending choice at N31 when the player never saved the spy', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '江湖浪客' }))
    await user.click(screen.getByRole('button', { name: '稳心' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    await user.click(screen.getByRole('button', { name: '谨慎离去，不惹祸上身' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '把残篇交回镖局' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '把残篇交回镖局' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X11')).toBeInTheDocument()
      expect(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('摸进后厨暗格，看看有没有人藏兵器'))

    await waitFor(() => {
      expect(screen.getByText(/^N11$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '谈判交换情报' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '谈判交换情报' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '仍做江湖浪客，把路留给自己' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '仍做江湖浪客，把路留给自己' }))

    await waitFor(() => {
      expect(screen.getByText('探索 · X20')).toBeInTheDocument()
      expect(getExplorationActionButton('翻查黑船边角货箱，看看有没有顺手兵刃')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('翻查黑船边角货箱，看看有没有顺手兵刃'))

    await waitFor(() => {
      expect(screen.getByText(/^N20$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '让人证先走，自己独自引开追兵' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '让人证先走，自己独自引开追兵' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '烧掉账册，让江湖自己去猜' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '烧掉账册，让江湖自己去猜' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '借芦苇水道转移证据' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: '借芦苇水道转移证据' }))

    await waitFor(() => {
      expect(screen.getByText(/^N31$/)).toBeInTheDocument()
    })

    expect(screen.getByText(/^N31$/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '送暗线远走，自己从此不留名' })).not.toBeInTheDocument()
  })

  it('unlocks the beam-shadow-route after exploring X11 for swallow-step', async () => {
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
      expect(getExplorationActionButton('沿梁试步，记下高处换位的落点')).toBeEnabled()
    })

    await user.click(getExplorationActionButton('沿梁试步，记下高处换位的落点'))

    await waitFor(() => {
      expect(screen.getByText(/^N11$/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '借燕行步翻上横梁，从高处看清谁在传递暗号' })).toBeEnabled()
    })
  })

  it('shows an extra righteous verdict option at N31 after winning the N30 battle', async () => {
    const user = userEvent.setup()
    seedGameAtNode('N30')

    render(<App />)

    await user.click(screen.getByRole('button', { name: '继续游戏' }))
    await user.click(screen.getByRole('button', { name: '回身守住栈桥，正面击退夜袭' }))

    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))
    await user.click(screen.getByRole('button', { name: /^破招/ }))
    await user.click(screen.getByRole('button', { name: /^攻击/ }))

    await waitFor(() => {
      expect(screen.getByText('战局已定')).toBeInTheDocument()
      expect(screen.getByText('战斗日志')).toBeInTheDocument()
      expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '继续前行' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '继续前行' }))

    expect(screen.getByText(/^N31$/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '挟昨夜胜势，当众逼主谋伏法' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借胜势伪造追缉，掩护暗线彻底脱身' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '趁众人还在争功，自己乘舟离岸' })).toBeInTheDocument()
  })

  it('hides the righteous verdict option at N31 after losing the N30 battle', async () => {
    const user = userEvent.setup()
    seedGameAtNode('N30')

    render(<App />)

    await user.click(screen.getByRole('button', { name: '继续游戏' }))
    await user.click(screen.getByRole('button', { name: '回身守住栈桥，正面击退夜袭' }))

    for (let index = 0; index < 12; index += 1) {
      await user.click(screen.getByRole('button', { name: /^运气/ }))
    }

    await waitFor(() => {
      expect(screen.getByText('战局已定')).toBeInTheDocument()
      expect(screen.getByText('战斗日志')).toBeInTheDocument()
      expect(screen.queryByText('章节结算')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '继续前行' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '继续前行' }))

    expect(screen.getByText(/^N31$/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '当众交证，让清流接手此案' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '趁败局把证据和人一起卖给黑市' })).toBeInTheDocument()
  })
})
