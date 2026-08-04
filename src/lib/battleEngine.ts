import type { BattleState, PlayerCharacter } from '../types/game';
import { generateEnemy } from './enemies';
import { calculateDamage, getEffectiveStats } from './gameLogic';

export function createBattleState(
  character: PlayerCharacter,
  isPremium: boolean,
  boss: boolean,
): Pick<BattleState, 'playerHp' | 'playerMaxHp' | 'enemy'> {
  const stats = getEffectiveStats(character, isPremium);
  const enemy = generateEnemy(character.level, boss);

  return {
    playerHp: stats.hp,
    playerMaxHp: stats.hp,
    enemy,
  };
}

export function applyPlayerAttack(
  state: BattleState,
  attackerAttack: number,
  defenderDefense: number,
  multiplier: number,
): BattleState {
  const damage = calculateDamage(attackerAttack, defenderDefense, multiplier);
  const newEnemyHp = Math.max(0, state.enemy.hp - damage);

  return {
    ...state,
    enemy: { ...state.enemy, hp: newEnemyHp },
    lastDamage: { target: 'enemy', amount: damage },
    phase: newEnemyHp <= 0 ? 'battle_won' : 'enemy_incoming',
  };
}

export function applyEnemyAttack(
  state: BattleState,
  attackerAttack: number,
  defenderDefense: number,
  multiplier: number,
): BattleState {
  const damage = calculateDamage(attackerAttack, defenderDefense, multiplier);
  const newPlayerHp = Math.max(0, state.playerHp - damage);

  return {
    ...state,
    playerHp: newPlayerHp,
    lastDamage: { target: 'player', amount: damage },
    phase: newPlayerHp <= 0 ? 'battle_lost' : 'player_choose',
  };
}
