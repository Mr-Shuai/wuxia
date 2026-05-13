import type { GameState } from '../game/types'

interface ResultScreenProps {
  state: GameState
  text: string
  onContinue: () => void
}

export default function ResultScreen({ state, text, onContinue }: ResultScreenProps) {
  const recentLogs = state.chapterLogs.slice(-3)

  return (
    <main className="screen shell result-layout">
      <section className="panel">
        <p className="eyebrow">章节结算</p>
        <h1>这一段江湖路，已经留下回声</h1>
        <p>{text}</p>
        <ul className="result-list">
          {recentLogs.map((log) => <li key={log}>{log}</li>)}
        </ul>
        <button type="button" className="primary-button" onClick={onContinue}>继续前行</button>
      </section>
    </main>
  )
}
