import type { EndingDefinition, GameState } from '../game/types'

interface EndingScreenProps {
  ending: EndingDefinition
  state: GameState
  onContinue?: () => void
  onRestart: () => void
}

export default function EndingScreen({ ending, state, onContinue, onRestart }: EndingScreenProps) {
  const keyTags = [
    state.flags.savedSpy ? '曾救下密探' : '未与暗线结缘',
    state.flags.wonInnDuel ? '酒楼一战成名' : '尚未在擂台留名',
    state.favorSword > state.favorBlackMarket ? '更偏正道' : '更偏灰线',
  ]

  const eyebrow = ending.nextNodeId ? '章节总结' : '终局'

  return (
    <main className="screen shell result-layout">
      <section className="panel">
        <p className="eyebrow">{eyebrow} · {ending.id}</p>
        <h1>{ending.title}</h1>
        <p>{ending.summary}</p>
        <div className="tag-row">
          <span>你的江湖画像：{ending.tone}</span>
          <span>侠义：{state.morality}</span>
          <span>通缉：{state.wantedLevel}</span>
          <span>名望：{state.reputation}</span>
        </div>
        <ul className="result-list">
          {keyTags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        {ending.nextNodeId && onContinue ? (
          <button type="button" className="primary-button" onClick={onContinue}>{ending.continueText ?? '继续前行'}</button>
        ) : null}
        <button type="button" className="primary-button" onClick={onRestart}>重新开始</button>
      </section>
    </main>
  )
}
