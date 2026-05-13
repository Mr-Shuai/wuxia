import type { GameState } from '../types'

const STORAGE_KEY = 'wuxia-save'

export interface StoredGameSnapshot {
  gameState: GameState
}

export function saveGame(snapshot: StoredGameSnapshot) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export function loadGame(): StoredGameSnapshot | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as StoredGameSnapshot) : null
}

export function clearGame() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export { STORAGE_KEY }
