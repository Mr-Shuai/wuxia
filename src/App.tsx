import { useEffect, useMemo, useState } from 'react'
import BattleScreen from './components/BattleScreen'
import CharacterCreateScreen from './components/CharacterCreateScreen'
import EndingScreen from './components/EndingScreen'
import ResultScreen from './components/ResultScreen'
import StartScreen from './components/StartScreen'
import StoryScreen from './components/StoryScreen'
import { endings } from './game/data/endings'
import { createBattleState, runBattleTurn } from './game/engine/battleEngine'
import { createGameState } from './game/engine/createGameState'
import { clearGame, loadGame, saveGame } from './game/engine/storage'
import { applyChoice, resolveEnding } from './game/engine/storyEngine'
import type { BattleState, GamePhase, GameState, PlayerAction, StoryChoice } from './game/types'

function applyBattleOutcome(
  state: GameState,
  battle: BattleState,
  choice: StoryChoice | null,
): { nextState: GameState; text: string } {
  const nextState: GameState = {
    ...state,
    hp: Math.max(1, battle.player.hp),
    qi: battle.player.qi,
    poise: battle.player.poise,
    flags: { ...state.flags },
    chapterLogs: [...state.chapterLogs],
  }

  if (battle.outcome === 'victory') {
    if (choice?.id === 'public-duel') {
      nextState.flags.wonInnDuel = true
      nextState.reputation += 1
    }

    return {
      nextState,
      text: '你赢下了这场较量，众人的目光也第一次真正落在你身上。',
    }
  }

  nextState.wantedLevel += 1
  nextState.chapterLogs.push('你负伤脱身，但这笔账已经被江湖记下。')
  return {
    nextState,
    text: '你负伤脱身，虽然没倒在当场，却也留下了新的代价。',
  }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('start')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [resultText, setResultText] = useState('')
  const [pendingBattleChoice, setPendingBattleChoice] = useState<StoryChoice | null>(null)
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    const snapshot = loadGame()
    if (snapshot?.gameState) {
      setHasSave(true)
    }
  }, [])

  useEffect(() => {
    if (gameState) {
      saveGame({ gameState })
      setHasSave(true)
    }
  }, [gameState])

  const ending = useMemo(() => {
    if (!gameState) return null
    return endings.find((item) => item.id === gameState.currentNodeId) ?? resolveEnding(gameState)
  }, [gameState])

  if (phase === 'start') {
    return (
      <StartScreen
        onStart={() => setPhase('create')}
        onContinue={hasSave ? () => {
          const snapshot = loadGame()
          if (!snapshot?.gameState) return
          setGameState(snapshot.gameState)
          setPhase(snapshot.gameState.currentNodeId.startsWith('E') ? 'ending' : 'story')
        } : undefined}
        onReset={hasSave ? () => {
          clearGame()
          setGameState(null)
          setBattleState(null)
          setPendingBattleChoice(null)
          setResultText('')
          setHasSave(false)
        } : undefined}
      />
    )
  }

  if (phase === 'create') {
    return <CharacterCreateScreen onSubmit={(payload) => {
      setGameState(createGameState(payload))
      setPhase('story')
    }} />
  }

  if (phase === 'story' && gameState) {
    return <StoryScreen state={gameState} onChoose={(choice) => {
      const next = applyChoice(gameState, gameState.currentNodeId, choice.id)
      setGameState(next)

      if (choice.battleId) {
        setPendingBattleChoice(choice)
        setBattleState(createBattleState(next, choice.battleId))
        setPhase('battle')
        return
      }

      setResultText(choice.effects.log)
      setPhase(choice.nextNodeId.startsWith('E') ? 'ending' : 'result')
    }} />
  }

  if (phase === 'battle' && battleState && gameState) {
    return <BattleScreen battle={battleState} onAction={(action: PlayerAction) => {
      const nextBattle = runBattleTurn(battleState, action)
      setBattleState(nextBattle)

      if (nextBattle.outcome !== 'ongoing') {
        const outcome = applyBattleOutcome(gameState, nextBattle, pendingBattleChoice)
        setGameState(outcome.nextState)
        setResultText(outcome.text)
        setPhase('result')
      }
    }} />
  }

  if (phase === 'result' && gameState) {
    return <ResultScreen state={gameState} text={resultText} onContinue={() => {
      setPendingBattleChoice(null)
      setBattleState(null)
      setPhase(gameState.currentNodeId.startsWith('E') ? 'ending' : 'story')
    }} />
  }

  if (phase === 'ending' && gameState && ending) {
    return <EndingScreen ending={ending} state={gameState} onRestart={() => {
      clearGame()
      setGameState(null)
      setBattleState(null)
      setPendingBattleChoice(null)
      setResultText('')
      setHasSave(false)
      setPhase('start')
    }} />
  }

  return null
}
