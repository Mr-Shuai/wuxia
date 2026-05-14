import { martialSkills } from '../game/data/martialSkills'
import type { StoryChoice } from '../game/types'

interface ChoiceListProps {
  choices: StoryChoice[]
  onChoose: (choice: StoryChoice) => void
  disabled?: boolean
}

export default function ChoiceList({ choices, onChoose, disabled = false }: ChoiceListProps) {
  return (
    <div className="choice-list">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className="choice-button"
          onClick={() => onChoose(choice)}
          disabled={disabled}
          aria-label={choice.text}
        >
          <span className="choice-card-topline">
            <span className="choice-card-route">推进至 {choice.nextNodeId}</span>
            {choice.battleId ? <span className="choice-card-chip">战斗</span> : null}
          </span>
          <span className="choice-card-text">{choice.text}</span>
          <span className="choice-card-bottomline">
            {choice.requires?.martialSkills?.map((skillId) => (
              <span key={skillId} className="choice-card-chip choice-card-chip-muted">
                需{martialSkills[skillId]?.name ?? skillId}
              </span>
            ))}
          </span>
        </button>
      ))}
    </div>
  )
}
