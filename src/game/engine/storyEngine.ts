import { endings } from '../data/endings'
import { storyNodes } from '../data/story'
import type { ChoiceRequirements, GameState, StatEffectKey, StoryChoice } from '../types'

const boundedStats = new Set<StatEffectKey>(['hp', 'qi', 'poise'])

function matchesRequirements(state: GameState, requirements?: ChoiceRequirements) {
  if (!requirements) {
    return true
  }

  for (const skillId of requirements.martialSkills ?? []) {
    if (!state.martialSkills.includes(skillId)) {
      return false
    }
  }

  for (const itemId of requirements.inventory ?? []) {
    if (!state.inventory.includes(itemId)) {
      return false
    }
  }

  for (const sceneKey of requirements.exploredScenes ?? []) {
    if (!state.exploredScenes.includes(sceneKey)) {
      return false
    }
  }

  for (const [flag, expected] of Object.entries(requirements.flags ?? {})) {
    if (state.flags[flag] !== expected) {
      return false
    }
  }

  for (const [stat, minValue] of Object.entries(requirements.minStats ?? {}) as [StatEffectKey, number][]) {
    if (state[stat] < minValue) {
      return false
    }
  }

  return true
}

export function isChoiceAvailable(state: GameState, choice: StoryChoice) {
  return matchesRequirements(state, choice.requires)
}

export function applyChoice(state: GameState, nodeId: string, choiceId: string): GameState {
  const node = storyNodes[nodeId]
  const choice = node?.choices.find((item) => item.id === choiceId)

  if (!node || !choice) {
    throw new Error(`Choice not found: ${nodeId}:${choiceId}`)
  }

  if (!isChoiceAvailable(state, choice)) {
    throw new Error(`Choice not available: ${nodeId}:${choiceId}`)
  }

  const next: GameState = {
    ...state,
    visitedNodes: [...state.visitedNodes],
    flags: { ...state.flags },
    chapterLogs: [...state.chapterLogs],
  }

  for (const [key, value] of Object.entries(choice.effects.stats ?? {}) as [StatEffectKey, number][]) {
    next[key] += value
    if (boundedStats.has(key)) {
      if (key === 'hp') next.hp = Math.max(0, Math.min(next.maxHp, next.hp))
      if (key === 'qi') next.qi = Math.max(0, Math.min(next.maxQi, next.qi))
      if (key === 'poise') next.poise = Math.max(0, Math.min(next.maxPoise, next.poise))
    }
  }

  for (const [flag, value] of Object.entries(choice.effects.flags ?? {})) {
    next.flags[flag] = value
  }

  next.chapterLogs.push(choice.effects.log)
  next.currentNodeId = choice.nextNodeId
  next.visitedNodes.push(choice.nextNodeId)

  return next
}

export function resolveEnding(state: GameState) {
  return endings.find((ending) => ending.condition(state)) ?? endings[endings.length - 1]
}
