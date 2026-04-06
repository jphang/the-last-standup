import type { AlienEnemy, AlienSpriteKey } from '../types/game';

interface EnemyTemplate {
  name: string;
  title: string;
  description: string;
  isBoss: boolean;
  statMultiplier: number;
  spriteKey: AlienSpriteKey;
}

const GRUNT_ENEMIES: EnemyTemplate[] = [
  {
    name: 'Bugzoid Grunt',
    title: 'Alien Soldier',
    description: 'A basic foot soldier. Smells like burnt JIRA tickets.',
    isBoss: false,
    statMultiplier: 1.15,
    spriteKey: 'alien',
  },
  {
    name: 'Scope Creep',
    title: 'Feature Parasite',
    description: 'It just keeps growing. And growing. Sound familiar?',
    isBoss: false,
    statMultiplier: 1.2,
    spriteKey: 'alien_brute',
  },
  {
    name: 'The Blocker',
    title: 'Impediment Entity',
    description: 'Nothing gets past this one. Like your PR reviews on a Friday.',
    isBoss: false,
    statMultiplier: 1.3,
    spriteKey: 'alien_brute',
  },
  {
    name: 'Sprint Breaker',
    title: 'Velocity Destroyer',
    description: 'Arrives mid-sprint and ruins everything. Just like that "quick fix" from the CEO.',
    isBoss: false,
    statMultiplier: 1.35,
    spriteKey: 'alien_spitter',
  },
  {
    name: 'Legacy Codex',
    title: 'Ancient Horror',
    description: 'Written in an alien language no one understands anymore. Just like your codebase.',
    isBoss: false,
    statMultiplier: 1.38,
    spriteKey: 'alien_stalker',
  },
  {
    name: 'Null Pointer',
    title: 'Void Entity',
    description: 'It references nothing. It IS nothing. Yet it crashes everything.',
    isBoss: false,
    statMultiplier: 1.18,
    spriteKey: 'alien_stalker',
  },
  {
    name: 'Deploy Friday',
    title: 'Chaos Agent',
    description: 'The alien equivalent of deploying on a Friday afternoon. Pure mayhem.',
    isBoss: false,
    statMultiplier: 1.25,
    spriteKey: 'alien_spitter',
  },
  {
    name: 'Merge Conflicton',
    title: 'Git Goblin',
    description: 'Created when two alien branches tried to merge. Nobody knows which version is correct.',
    isBoss: false,
    statMultiplier: 1.22,
    spriteKey: 'alien_drone',
  },
];

const BOSS_ENEMY: EnemyTemplate = {
  name: 'Dr. Marcus Pivot',
  title: 'The Traitor CTO',
  description: 'I\'m not destroying humanity, I\'m DISRUPTING it! This is the ultimate pivot! My Kanban board of doom is perfectly organized!',
  isBoss: true,
  statMultiplier: 1.6,
  spriteKey: 'alien',
};

function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEnemy(playerLevel: number, forceBoss = false): AlienEnemy {
  const template = forceBoss
    ? BOSS_ENEMY
    : GRUNT_ENEMIES[Math.floor(Math.random() * GRUNT_ENEMIES.length)];

  const baseHp = 35 + playerLevel * 8;
  const baseAtk = 7 + playerLevel * 3;
  const baseDef = 5 + playerLevel * 2;

  const hp = Math.max(10, Math.floor(baseHp * template.statMultiplier) + randRange(-3, 3));
  const attack = Math.max(3, Math.floor(baseAtk * template.statMultiplier) + randRange(-1, 2));
  const defense = Math.max(1, Math.floor(baseDef * template.statMultiplier) + randRange(-1, 2));
  const level = Math.max(1, playerLevel + (template.isBoss ? 1 : randRange(-1, 1)));

  return {
    name: template.name,
    title: template.title,
    description: template.description,
    hp,
    maxHp: hp,
    attack,
    defense,
    level,
    isBoss: template.isBoss,
    spriteKey: template.spriteKey,
  };
}

export function isBossEligible(playerLevel: number): boolean {
  return playerLevel >= 3;
}
