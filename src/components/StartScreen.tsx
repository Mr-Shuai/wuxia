interface StartScreenProps {
  onStart: () => void
  onContinue?: () => void
  onReset?: () => void
}

export default function StartScreen({ onStart, onContinue, onReset }: StartScreenProps) {
  return (
    <main className="screen shell hero-screen">
      <div className="hero-panel">
        <p className="eyebrow">武侠 Web MVP</p>
        <h1>门规有代价，侠名也有回声</h1>
        <p className="lead">
          在风雨将至的江湖里，以抉择、名声与一口真气，为自己走出第一段命运。
        </p>
        <div className="choice-list">
          <button type="button" className="primary-button" onClick={onStart}>开始江湖</button>
          {onContinue ? <button type="button" onClick={onContinue}>继续游戏</button> : null}
          {onReset ? <button type="button" onClick={onReset}>重新开始</button> : null}
        </div>
      </div>
    </main>
  )
}
