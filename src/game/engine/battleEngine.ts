import { battles } from '../data/battles'
import { martialSkills } from '../data/martialSkills'
import { weapons } from '../data/weapons'
import type { BattleState, GameState, PlayerAction } from '../types'

function getWeaponStats(state: GameState) {
  if (!state.activeWeaponId) {
    return { attackBonus: 0, defenseBonus: 0 }
  }

  const weapon = weapons[state.activeWeaponId]

  return {
    attackBonus: weapon?.attackBonus ?? 0,
    defenseBonus: weapon?.defenseBonus ?? 0,
  }
}

function getMartialSkillBonuses(state: GameState) {
  return state.martialSkills.reduce(
    (total, skillId) => {
      const skill = martialSkills[skillId]

      total.attackBonus += skill?.attackBonus ?? 0
      total.poiseBonus += skill?.poiseBonus ?? 0

      return total
    },
    { attackBonus: 0, poiseBonus: 0 },
  )
}

export function createBattleState(player: GameState, battleId: string): BattleState {
  const definition = battles[battleId]

  if (!definition) {
    throw new Error(`Battle not found: ${battleId}`)
  }

  const weaponStats = getWeaponStats(player)
  const martialBonuses = getMartialSkillBonuses(player)
  const maxPoise = player.maxPoise + martialBonuses.poiseBonus

  return {
    title: definition.title,
    player: {
      hp: player.hp,
      qi: player.qi,
      poise: Math.min(maxPoise, player.poise + martialBonuses.poiseBonus),
      attack: player.attack + weaponStats.attackBonus + martialBonuses.attackBonus,
      defense: player.defense + weaponStats.defenseBonus,
      maxHp: player.maxHp,
      maxQi: player.maxQi,
      maxPoise,
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
