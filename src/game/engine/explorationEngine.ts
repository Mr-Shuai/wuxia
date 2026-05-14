import { explorationScenes } from '../data/exploration'
import type { GameState } from '../types'

export function applyExplorationAction(state: GameState, sceneId: string, actionId: string): GameState {
  const scene = explorationScenes[sceneId]

  if (!scene) {
    throw new Error(`Exploration scene not found: ${sceneId}`)
  }

  const action = scene.actions.find((item) => item.id === actionId)

  if (!action) {
    throw new Error(`Exploration action not found: ${sceneId}:${actionId}`)
  }

  const exploredKey = `${sceneId}:${actionId}`

  if (action.once && state.exploredScenes.includes(exploredKey)) {
    return state
  }

  const next: GameState = {
    ...state,
    inventory: [...state.inventory],
    martialSkills: [...state.martialSkills],
    exploredScenes: [...state.exploredScenes],
    visitedNodes: [...state.visitedNodes],
    flags: { ...state.flags },
    chapterLogs: [...state.chapterLogs],
  }

  if (!next.exploredScenes.includes(exploredKey)) {
    next.exploredScenes.push(exploredKey)
  }

  if (action.rewards?.weaponId && !next.inventory.includes(action.rewards.weaponId)) {
    next.inventory.push(action.rewards.weaponId)
    next.activeWeaponId = action.rewards.weaponId
  }

  if (action.rewards?.martialSkillId && !next.martialSkills.includes(action.rewards.martialSkillId)) {
    next.martialSkills.push(action.rewards.martialSkillId)
  }

  next.chapterLogs.push(action.log)
  next.currentNodeId = action.nextNodeId

  if (!next.visitedNodes.includes(action.nextNodeId)) {
    next.visitedNodes.push(action.nextNodeId)
  }

  return next
}
