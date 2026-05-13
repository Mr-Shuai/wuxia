import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

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

    expect(screen.getByText(/N00/)).toBeInTheDocument()
    expect(screen.getByText(/破庙夜雨/)).toBeInTheDocument()
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

  it('plays a full non-battle route into N12 and reaches a final ending', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: '开始江湖' }))
    await user.type(screen.getByLabelText('角色名'), '阿青')
    await user.click(screen.getByRole('button', { name: '破落书生' }))
    await user.click(screen.getByRole('button', { name: '听风' }))
    await user.click(screen.getByRole('button', { name: '踏入江湖' }))

    await user.click(screen.getByRole('button', { name: '收留并救治密探' }))
    await user.click(screen.getByRole('button', { name: '继续前行' }))
    await user.click(screen.getByRole('button', { name: '把残篇交回镖局' }))
    await user.click(screen.getByRole('button', { name: '继续前行' }))
    await user.click(screen.getByRole('button', { name: '谈判交换情报' }))
    await user.click(screen.getByRole('button', { name: '继续前行' }))

    expect(screen.getByText(/N12/)).toBeInTheDocument()
    expect(screen.getByText(/山门试剑/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '入清正剑宗，换一条正路' }))

    expect(screen.getByText(/结局/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '正道倾向' })).toBeInTheDocument()
  })
})
