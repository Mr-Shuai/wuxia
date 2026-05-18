import { explorationScenes } from '../data/exploration'
import { explorationMaps } from '../data/explorationMaps'
import type { GameState } from '../types'

function cloneState(state: GameState): GameState {
  return {
    ...state,
    inventory: [...state.inventory],
    martialSkills: [...state.martialSkills],
    exploredScenes: [...state.exploredScenes],
    visitedNodes: [...state.visitedNodes],
    flags: { ...state.flags },
    chapterLogs: [...state.chapterLogs],
    completedMapNodes: [...state.completedMapNodes],
    purchasedShopItems: [...state.purchasedShopItems],
    completedSideQuests: [...state.completedSideQuests],
  }
}

function applyReward(
  state: GameState,
  reward?: { weaponId?: string; martialSkillId?: string; itemId?: string; silver?: number },
) {
  if (!reward) {
    return
  }

  if (typeof reward.silver === 'number') {
    state.silver += reward.silver
  }

  if (reward.weaponId && !state.inventory.includes(reward.weaponId)) {
    state.inventory.push(reward.weaponId)
    state.activeWeaponId = reward.weaponId
  }

  if (reward.martialSkillId && !state.martialSkills.includes(reward.martialSkillId)) {
    state.martialSkills.push(reward.martialSkillId)
  }

  if (reward.itemId && !state.inventory.includes(reward.itemId)) {
    state.inventory.push(reward.itemId)
  }
}

function applyStatChanges(state: GameState, stats?: Partial<GameState>) {
  if (!stats) {
    return
  }

  for (const [key, delta] of Object.entries(stats)) {
    if (typeof delta !== 'number') {
      continue
    }

    const statKey = key as keyof GameState
    const currentValue = state[statKey]

    if (typeof currentValue === 'number') {
      ;(state[statKey] as number) = currentValue + delta
    }
  }
}

export function enterExplorationMap(state: GameState, mapId: string): GameState {
  const map = explorationMaps[mapId]

  if (!map) {
    throw new Error(`Exploration map not found: ${mapId}`)
  }

  return {
    ...state,
    currentExplorationMapId: map.id,
    explorationReturnNodeId: map.returnNodeId,
  }
}

export function applyMapNodeAction(
  state: GameState,
  mapId: string,
  nodeId: string,
  shopItemId?: string,
): GameState {
  const map = explorationMaps[mapId]

  if (!map) {
    throw new Error(`Exploration map not found: ${mapId}`)
  }

  if (!state.currentExplorationMapId) {
    throw new Error(`No active exploration map. Expected ${mapId}.`)
  }

  if (state.currentExplorationMapId !== mapId) {
    throw new Error(
      `Active exploration map mismatch: expected ${state.currentExplorationMapId}, got ${mapId}`,
    )
  }

  const node = map.nodes.find((item) => item.id === nodeId)

  if (!node) {
    throw new Error(`Exploration map node not found: ${mapId}:${nodeId}`)
  }

  const completedNodeKey = `${mapId}:${nodeId}`

  if (node.once && state.completedMapNodes.includes(completedNodeKey)) {
    return state
  }

  if (node.type === 'exit') {
    return state
  }

  if (node.type === 'shop') {
    const shopItem = node.shopItems?.find((item) => item.id === shopItemId)

    if (!shopItem) {
      throw new Error(`Exploration shop item not found: ${mapId}:${nodeId}:${shopItemId}`)
    }

    if (shopItem.once && state.purchasedShopItems.includes(shopItem.id)) {
      return state
    }

    if (state.silver < shopItem.price) {
      return state
    }

    const next = cloneState(state)
    next.silver -= shopItem.price
    next.purchasedShopItems.push(shopItem.id)
    applyReward(next, shopItem.reward)

    return next
  }

  const next = cloneState(state)
  next.completedMapNodes.push(completedNodeKey)

  if (node.type === 'sidequest' && node.quest) {
    if (!next.completedSideQuests.includes(node.quest.id)) {
      next.completedSideQuests.push(node.quest.id)
    }

    applyStatChanges(next, node.quest.effects?.stats)

    if (node.quest.effects?.flags) {
      next.flags = { ...next.flags, ...node.quest.effects.flags }
    }

    applyReward(next, node.quest.reward)
    applyReward(next, node.quest.effects?.rewards)
    next.chapterLogs.push(node.quest.log)

    return next
  }

  applyReward(next, node.reward)

  if (node.log) {
    next.chapterLogs.push(node.log)
  }

  return next
}

export function leaveExplorationMap(state: GameState): GameState {
  const currentMap = state.currentExplorationMapId ? explorationMaps[state.currentExplorationMapId] : undefined
  const returnNodeId = state.explorationReturnNodeId ?? currentMap?.returnNodeId

  if (!returnNodeId) {
    return state
  }

  const next = cloneState(state)
  next.currentExplorationMapId = undefined
  next.explorationReturnNodeId = undefined
  next.currentNodeId = returnNodeId

  if (!next.visitedNodes.includes(returnNodeId)) {
    next.visitedNodes.push(returnNodeId)
  }

  return next
}

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

  const next = cloneState(state)

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
