import ChoiceList from './ChoiceList'
import StatusPanel from './StatusPanel'
import { storyNodes } from '../game/data/story'
import type { GameState, StoryChoice } from '../game/types'

interface StoryScreenProps {
  state: GameState
  onChoose: (choice: StoryChoice) => void
}

export default function StoryScreen({ state, onChoose }: StoryScreenProps) {
  const node = storyNodes[state.currentNodeId]

  return (
    <main className="screen shell two-column">
      <section className="panel story-panel">
        <p className="eyebrow">{node.id}</p>
        <h1>{node.title}</h1>
        <p className="location">{node.location}</p>
        <div className="story-copy">
          {node.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ChoiceList choices={node.choices} onChoose={onChoose} />
      </section>
      <StatusPanel state={state} />
    </main>
  )
}
