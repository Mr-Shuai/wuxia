import { useEffect, useMemo, useState } from 'react'
import BattleScreen from './components/BattleScreen'
import CharacterCreateScreen from './components/CharacterCreateScreen'
import EndingScreen from './components/EndingScreen'
import ExplorationScreen from './components/ExplorationScreen'
import StartScreen from './components/StartScreen'
import StoryScreen from './components/StoryScreen'
import { explorationScenes } from './game/data/exploration'
import { endings } from './game/data/endings'
import { createBattleState, runBattleTurn } from './game/engine/battleEngine'
import { createGameState } from './game/engine/createGameState'
import { applyExplorationAction } from './game/engine/explorationEngine'
import { clearGame, loadGame, saveGame } from './game/engine/storage'
import { applyChoice, resolveEnding } from './game/engine/storyEngine'
import type { BattleState, GamePhase, GameState, PlayerAction, StoryChoice } from './game/types'

interface InlineNarrationState {
  context: 'story' | 'exploration' | 'battle'
  fullText: string
  visibleText: string
}

const explorationEntryByNode: Record<string, string> = {
  N11: 'X11',
  N20: 'X20',
  N110: 'X100',
}

function isEndingNodeId(nodeId: string) {
  return endings.some((item) => item.id === nodeId)
}

function isExplorationSceneId(nodeId: string) {
  return nodeId in explorationScenes
}

function hasExploredScene(state: GameState, sceneId: string) {
  return state.exploredScenes.some((key) => key.startsWith(`${sceneId}:`))
}

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

      if (choice?.id === 'hold-the-pier') {
        nextState.flags.wonNightRaid = true
        nextState.flags.lostNightRaid = false
        nextState.reputation += 1

      return {
        nextState,
        text: '你守住了栈桥，夜袭统领被迫退走，白堤上的最后裁断也因此多了一分向你倾斜的声势。',
        }
      }

      if (choice?.id === 'seal-the-wharf-head-on' || choice?.id === 'cut-signal-from-catwalk') {
        nextState.reputation += 1

        return {
          nextState,
          text: '你压住了盐港前闸，私盐护头溃退，南路旧册与巡按口供终于被你一并护到了能见天光的地方。',
        }
      }

      return {
        nextState,
        text: '你赢下了这场较量，众人的目光也第一次真正落在你身上。',
      }
  }

  nextState.wantedLevel += 1
  if (choice?.id === 'hold-the-pier') {
    nextState.flags.wonNightRaid = false
    nextState.flags.lostNightRaid = true
    nextState.chapterLogs.push('你没能守住整条栈桥，只得带着残局赶往白堤。')

    return {
      nextState,
      text: '你被夜袭统领逼退，虽然仍把人带到了白堤，却已失了当众定案的最佳时机。',
    }
  }

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
  const [pendingBattleChoice, setPendingBattleChoice] = useState<StoryChoice | null>(null)
  const [inlineNarration, setInlineNarration] = useState<InlineNarrationState | null>(null)
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

  useEffect(() => {
    if (!inlineNarration || inlineNarration.visibleText === inlineNarration.fullText) {
      return
    }

    const timer = window.setTimeout(() => {
      setInlineNarration((current) => {
        if (!current) {
          return current
        }

        const nextLength = Math.min(current.fullText.length, current.visibleText.length + 2)

        return {
          ...current,
          visibleText: current.fullText.slice(0, nextLength),
        }
      })
    }, 18)

    return () => window.clearTimeout(timer)
  }, [inlineNarration])

  const ending = useMemo(() => {
    if (!gameState) return null
    return endings.find((item) => item.id === gameState.currentNodeId) ?? resolveEnding(gameState)
  }, [gameState])

  const storyInlineResult =
    phase === 'story' && gameState && inlineNarration?.context === 'story'
      ? {
          text: inlineNarration.visibleText,
          recentLogs: gameState.chapterLogs.slice(-3),
          streaming: inlineNarration.visibleText !== inlineNarration.fullText,
        }
      : null

  const explorationInlineResult =
    phase === 'exploration' && gameState && inlineNarration?.context === 'exploration'
      ? {
          text: inlineNarration.visibleText,
          recentLogs: gameState.chapterLogs.slice(-3),
          streaming: inlineNarration.visibleText !== inlineNarration.fullText,
        }
      : null

  const battleInlineResult =
    phase === 'battle' && gameState && inlineNarration?.context === 'battle'
      ? {
          text: inlineNarration.visibleText,
          recentLogs: gameState.chapterLogs.slice(-3),
          streaming: inlineNarration.visibleText !== inlineNarration.fullText,
        }
      : null

  if (phase === 'start') {
    return (
      <StartScreen
        onStart={() => {
          setInlineNarration(null)
          setPhase('create')
        }}
        onContinue={hasSave ? () => {
          const snapshot = loadGame()
          if (!snapshot?.gameState) return
          const restored = snapshot.gameState
          setInlineNarration(null)

          if (isExplorationSceneId(restored.currentNodeId)) {
            const sceneId = restored.currentNodeId
            const storyNodeId = Object.entries(explorationEntryByNode).find(([, value]) => value === sceneId)?.[0]

            if (storyNodeId && hasExploredScene(restored, sceneId)) {
              setGameState({
                ...restored,
                currentNodeId: storyNodeId,
              })
              setPhase(isEndingNodeId(storyNodeId) ? 'ending' : 'story')
              return
            }

            setGameState(restored)
            setPhase('exploration')
            return
          }

          setGameState(restored)
          setPhase(isEndingNodeId(restored.currentNodeId) ? 'ending' : 'story')
        } : undefined}
        onReset={hasSave ? () => {
          clearGame()
          setGameState(null)
          setBattleState(null)
          setPendingBattleChoice(null)
          setInlineNarration(null)
          setHasSave(false)
        } : undefined}
      />
    )
  }

  if (phase === 'create') {
    return <CharacterCreateScreen onSubmit={(payload) => {
      setInlineNarration(null)
      setGameState(createGameState(payload))
      setPhase('story')
    }} />
  }

  if (phase === 'story' && gameState) {
    return <StoryScreen state={gameState} inlineResult={storyInlineResult} disableChoices={storyInlineResult?.streaming} onChoose={(choice) => {
      const next = applyChoice(gameState, gameState.currentNodeId, choice.id)

      if (choice.battleId) {
        setInlineNarration(null)
        setGameState(next)
        setPendingBattleChoice(choice)
        setBattleState(createBattleState(next, choice.battleId))
        setPhase('battle')
        return
      }

      const explorationSceneId = explorationEntryByNode[choice.nextNodeId]

      if (explorationSceneId && !hasExploredScene(next, explorationSceneId)) {
        setGameState({
          ...next,
          currentNodeId: explorationSceneId,
        })
        setInlineNarration({
          context: 'exploration',
          fullText: choice.effects.log,
          visibleText: '',
        })
        setPhase('exploration')
        return
      }

      setGameState(next)

      if (isEndingNodeId(choice.nextNodeId)) {
        setInlineNarration(null)
        setPhase('ending')
        return
      }

      setInlineNarration({
        context: 'story',
        fullText: choice.effects.log,
        visibleText: '',
      })
    }} />
  }

  if (phase === 'exploration' && gameState) {
    const scene = explorationScenes[gameState.currentNodeId]

    return <ExplorationScreen state={gameState} scene={scene} inlineResult={explorationInlineResult} disableChoices={explorationInlineResult?.streaming} onChoose={(action) => {
      const next = applyExplorationAction(gameState, scene.id, action.id)
      setGameState(next)
      setInlineNarration({
        context: 'story',
        fullText: action.log,
        visibleText: '',
      })
      setPhase(isEndingNodeId(action.nextNodeId) ? 'ending' : 'story')
    }} />
  }

  if (phase === 'battle' && battleState && gameState) {
    return <BattleScreen battle={battleState} inlineResult={battleInlineResult} onAction={(action: PlayerAction) => {
      const nextBattle = runBattleTurn(battleState, action)
      setBattleState(nextBattle)

      if (nextBattle.outcome !== 'ongoing') {
        const outcome = applyBattleOutcome(gameState, nextBattle, pendingBattleChoice)
        setGameState(outcome.nextState)
        setInlineNarration({
          context: 'battle',
          fullText: outcome.text,
          visibleText: '',
        })
      }
    }} onContinue={battleInlineResult && !battleInlineResult.streaming ? () => {
      setInlineNarration(null)
      setPendingBattleChoice(null)
      setBattleState(null)
      setPhase(isEndingNodeId(gameState.currentNodeId) ? 'ending' : 'story')
    } : undefined} />
  }

  if (phase === 'ending' && gameState && ending) {
    return <EndingScreen ending={ending} state={gameState} onContinue={ending.nextNodeId ? () => {
      setGameState((current) => {
        if (!current || !ending.nextNodeId) return current

        return {
          ...current,
          currentNodeId: ending.nextNodeId,
          visitedNodes: [...current.visitedNodes, ending.nextNodeId],
          chapterLogs: [...current.chapterLogs, `你带着“${ending.title}”的余波继续前行。`],
        }
      })
      setInlineNarration(null)
      setPhase('story')
    } : undefined} onRestart={() => {
      clearGame()
      setGameState(null)
      setBattleState(null)
      setPendingBattleChoice(null)
      setInlineNarration(null)
      setHasSave(false)
      setPhase('start')
    }} />
  }

  return null
}
