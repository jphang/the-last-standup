import type { PlayerCharacter, CharacterClass } from '../types/game';

export const CLASS_GROWTHS: Record<CharacterClass, { hp: [number, number]; atk: [number, number]; def: [number, number] }> = {
  ceo:       { hp: [1, 4], atk: [1, 3], def: [0, 3] },
  fullstack: { hp: [0, 3], atk: [2, 4], def: [0, 2] },
  devops:    { hp: [1, 3], atk: [0, 2], def: [2, 4] },
  designer:  { hp: [1, 4], atk: [1, 3], def: [1, 3] },
  qa:        { hp: [0, 3], atk: [1, 4], def: [0, 3] },
  support:   { hp: [1, 4], atk: [0, 2], def: [1, 4] },
  pm:        { hp: [1, 3], atk: [1, 3], def: [1, 3] },
  sales:     { hp: [0, 2], atk: [2, 5], def: [0, 1] },
  recruiter: { hp: [2, 4], atk: [0, 1], def: [2, 4] },
  intern:    { hp: [0, 2], atk: [0, 2], def: [0, 2] },
};

function rollGrowth(range: [number, number]): number {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

export function calculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  multiplier: number = 1
): number {
  const base = Math.floor(attackerAttack * 0.2);
  const raw = Math.max(base, attackerAttack - defenderDefense);
  return Math.max(1, Math.floor(raw * multiplier));
}

export function calculateExpGain(playerLevel: number, enemyLevel: number, isBoss: boolean): number {
  const base = 15 + enemyLevel * 3;
  const levelDiff = enemyLevel - playerLevel;
  const bonus = Math.max(0, levelDiff * 5);
  const bossBonus = isBoss ? 25 : 0;
  return Math.min(99, base + bonus + bossBonus);
}

export function processLevelUp(character: PlayerCharacter, expGained: number): {
  newLevel: number;
  newExp: number;
  hpGain: number;
  attackGain: number;
  defenseGain: number;
  levelsGained: number;
} {
  let totalExp = character.exp + expGained;
  let levelsGained = 0;
  let hpGain = 0;
  let attackGain = 0;
  let defenseGain = 0;

  const growths = CLASS_GROWTHS[(character.character_key as CharacterClass)] ?? CLASS_GROWTHS.intern;

  while (totalExp >= 100) {
    totalExp -= 100;
    levelsGained++;
    hpGain += rollGrowth(growths.hp);
    attackGain += rollGrowth(growths.atk);
    defenseGain += rollGrowth(growths.def);
  }

  return {
    newLevel: character.level + levelsGained,
    newExp: totalExp,
    hpGain,
    attackGain,
    defenseGain,
    levelsGained,
  };
}

export function getEffectiveStats(
  character: PlayerCharacter,
  isPremium: boolean
): { hp: number; attack: number; defense: number } {
  const multiplier = isPremium ? 3 : 1;
  return {
    hp: character.max_hp * multiplier,
    attack: character.attack * multiplier,
    defense: character.defense * multiplier,
  };
}
