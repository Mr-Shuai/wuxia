import type { StoryChoice } from '../game/types'

interface ChoiceListProps {
  choices: StoryChoice[]
  onChoose: (choice: StoryChoice) => void
}

export default function ChoiceList({ choices, onChoose }: ChoiceListProps) {
  return (
    <div className="choice-list">
      {choices.map((choice) => (
        <button key={choice.id} type="button" className="choice-button" onClick={() => onChoose(choice)}>
          {choice.text}
        </button>
      ))}
    </div>
  )
}
