import { battles } from '../data/battles'
import type { BattleState, GameState, PlayerAction } from '../types'

export function createBattleState(player: GameState, battleId: string): BattleState {
  const definition = battles[battleId]

  if (!definition) {
    throw new Error(`Battle not found: ${battleId}`)
  }

  return {
    player: {
      hp: player.hp,
      qi: player.qi,
      poise: player.poise,
      attack: player.attack,
      defense: player.defense,
      maxHp: player.maxHp,
      maxQi: player.maxQi,
      maxPoise: player.maxPoise,
    },
    enemy: { ...definition.enemy },
    log: [`${definition.enemy.name} 挡在了你的去路。`],
    outcome: 'ongoing',
  }
}

export function runBattleTurn(state: BattleState, action: PlayerAction): BattleState {
  const next: BattleState = {
    ...state,
    player: { ...state.player },
    enemy: { ...state.enemy },
    log: [...state.log],
  }

  if (action === 'attack') {
    next.enemy.hp -= Math.max(4, next.player.attack - next.enemy.defense)
    next.enemy.poise = Math.max(0, next.enemy.poise - 3)
    next.log.push('你沉步进击，逼退了对手。')
  }

  if (action === 'focus') {
    next.player.qi = Math.min(next.player.maxQi, next.player.qi + 3)
    next.player.poise = Math.min(next.player.maxPoise, next.player.poise + 2)
    next.log.push('你调匀气息，稳住了架势。')
  }

  if (action === 'guard') {
    next.player.poise = Math.min(next.player.maxPoise, next.player.poise + 1)
    next.log.push('你收势守门，静待来招。')
  }

  if (action === 'break') {
    next.player.qi = Math.max(0, next.player.qi - 2)
    const damage = next.enemy.poise === 0 ? 10 : 5
    next.enemy.hp -= damage
    next.log.push('你抓住破绽，一招破招直取中门。')
  }

  if (next.enemy.hp <= 0) {
    next.outcome = 'victory'
    next.enemy.hp = 0
    return next
  }

  const guardReduction = action === 'guard' ? 2 : 0
  const enemyDamage = Math.max(2, next.enemy.attack - next.player.defense - guardReduction)
  next.player.hp = Math.max(0, next.player.hp - enemyDamage)
  next.player.poise = Math.max(0, next.player.poise - (action === 'guard' ? 1 : 2))
  next.log.push(`${next.enemy.name} 反手逼近，给你造成 ${enemyDamage} 点伤害。`)

  if (next.player.hp <= 0) {
    next.outcome = 'defeat'
  }

  return next
}
