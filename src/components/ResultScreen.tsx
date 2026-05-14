interface ResultScreenProps {
  eyebrow?: string
  title?: string
  text: string
  recentLogs?: string[]
  streaming?: boolean
  className?: string
}

export default function ResultScreen({
  eyebrow = '江湖回声',
  title = '这一段余波，正在眼前铺开',
  text,
  recentLogs = [],
  streaming = false,
  className = '',
}: ResultScreenProps) {
  if (!text && recentLogs.length === 0) {
    return null
  }

  return (
    <section className={`panel inline-result-panel ${className}`.trim()}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="inline-result-copy">
        {text}
        {streaming ? <span className="stream-cursor" aria-hidden="true">▍</span> : null}
      </p>
      {recentLogs.length > 0 ? (
        <ul className="result-list inline-result-list">
          {recentLogs.map((log) => <li key={log}>{log}</li>)}
        </ul>
      ) : null}
    </section>
  )
}
