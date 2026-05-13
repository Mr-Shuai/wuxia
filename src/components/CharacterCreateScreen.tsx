import { useMemo, useState } from 'react'
import { origins } from '../game/data/origins'
import { talents } from '../game/data/talents'
import type { OriginId, TalentId } from '../game/types'

interface CharacterCreateScreenProps {
  onSubmit: (payload: { name: string; originId: OriginId; talentId: TalentId }) => void
}

export default function CharacterCreateScreen({ onSubmit }: CharacterCreateScreenProps) {
  const [name, setName] = useState('')
  const [originId, setOriginId] = useState<OriginId | null>(null)
  const [talentId, setTalentId] = useState<TalentId | null>(null)

  const summary = useMemo(() => {
    if (!originId || !talentId) return null
    const origin = origins[originId]
    const talent = talents[talentId]
    return {
      hp: origin.base.maxHp + talent.bonus.maxHp,
      qi: origin.base.maxQi + talent.bonus.maxQi,
      poise: origin.base.maxPoise + talent.bonus.maxPoise,
    }
  }, [originId, talentId])

  return (
    <main className="screen shell two-column">
      <section className="panel">
        <p className="eyebrow">角色创建</p>
        <label className="field">
          <span>角色名</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入姓名" />
        </label>

        <div className="section-block">
          <h2>选择出身</h2>
          <div className="option-grid">
            {Object.values(origins).map((origin) => (
              <button
                key={origin.id}
                type="button"
                aria-label={origin.name}
                className={originId === origin.id ? 'option-card selected' : 'option-card'}
                onClick={() => setOriginId(origin.id)}
              >
                <strong>{origin.name}</strong>
                <span>{origin.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="section-block">
          <h2>选择天赋</h2>
          <div className="option-grid">
            {Object.values(talents).map((talent) => (
              <button
                key={talent.id}
                type="button"
                aria-label={talent.name}
                className={talentId === talent.id ? 'option-card selected' : 'option-card'}
                onClick={() => setTalentId(talent.id)}
              >
                <strong>{talent.name}</strong>
                <span>{talent.description}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="primary-button"
          disabled={!name.trim() || !originId || !talentId}
          onClick={() => originId && talentId && onSubmit({ name: name.trim(), originId, talentId })}
        >
          踏入江湖
        </button>
      </section>

      <aside className="panel summary-panel">
        <p className="eyebrow">初始概览</p>
        {summary ? (
          <ul className="summary-list">
            <li>生命：{summary.hp}</li>
            <li>内力：{summary.qi}</li>
            <li>架势：{summary.poise}</li>
          </ul>
        ) : (
          <p className="muted">选定出身与天赋后，这里会展示你的起手底子。</p>
        )}
      </aside>
    </main>
  )
}
