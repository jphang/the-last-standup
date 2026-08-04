import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AlienEnemy, BattleState, PlayerCharacter } from '../src/types/game';
import { applyEnemyAttack, applyPlayerAttack, createBattleState } from '../src/lib/battleEngine';

function makeCharacter(overrides: Partial<PlayerCharacter> = {}): PlayerCharacter {
  return {
    id: 'char-1',
    user_id: 'user-1',
    name: 'Test Character',
    character_key: 'ceo',
    level: 1,
    exp: 0,
    max_hp: 50,
    current_hp: 50,
    attack: 12,
    defense: 8,
    battles_won: 0,
    battles_lost: 0,
    boss_defeats: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeEnemy(overrides: Partial<AlienEnemy> = {}): AlienEnemy {
  return {
    name: 'Bugzoid Grunt',
    title: 'Alien Soldier',
    description: 'A basic foot soldier.',
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    level: 1,
    isBoss: false,
    spriteKey: 'alien',
    ...overrides,
  };
}

function makeBattleState(overrides: Partial<BattleState> = {}): BattleState {
  return {
    playerHp: 100,
    playerMaxHp: 100,
    enemy: makeEnemy(),
    phase: 'player_choose',
    currentQuestion: null,
    battleLog: [],
    expGained: 0,
    lastDamage: null,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createBattleState', () => {
  it('initializes player HP from effective stats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createBattleState(makeCharacter(), false, false);
    expect(state.playerHp).toBe(50);
    expect(state.playerMaxHp).toBe(50);
  });

  it('triples player HP for premium players', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createBattleState(makeCharacter(), true, false);
    expect(state.playerHp).toBe(150);
    expect(state.playerMaxHp).toBe(150);
  });

  it('generates a boss enemy when requested', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const state = createBattleState(makeCharacter(), false, true);
    expect(state.enemy.isBoss).toBe(true);
    expect(state.enemy.name).toBe('Dr. Marcus Pivot');
  });
});

describe('applyPlayerAttack', () => {
  it('reduces enemy HP, records damage, and moves to enemy turn', () => {
    const next = applyPlayerAttack(makeBattleState(), 50, 10, 1);

    expect(next.enemy.hp).toBe(60);
    expect(next.lastDamage).toEqual({ target: 'enemy', amount: 40 });
    expect(next.phase).toBe('enemy_incoming');
  });

  it('clamps enemy HP at zero and ends the battle on a killing blow', () => {
    const state = makeBattleState({ enemy: makeEnemy({ hp: 20 }) });
    const next = applyPlayerAttack(state, 50, 10, 1);

    expect(next.enemy.hp).toBe(0);
    expect(next.phase).toBe('battle_won');
  });

  it('deals double damage with a Knowledge Strike multiplier', () => {
    const next = applyPlayerAttack(makeBattleState(), 50, 10, 2);

    expect(next.lastDamage).toEqual({ target: 'enemy', amount: 80 });
    expect(next.enemy.hp).toBe(20);
  });

  it('keeps enemy HP unchanged when the attack is fully absorbed', () => {
    const next = applyPlayerAttack(makeBattleState(), 10, 100, 1);
    expect(next.enemy.hp).toBe(98);
  });
});

describe('applyEnemyAttack', () => {
  it('reduces player HP, records damage, and returns control to the player', () => {
    const next = applyEnemyAttack(makeBattleState(), 50, 10, 1);

    expect(next.playerHp).toBe(60);
    expect(next.lastDamage).toEqual({ target: 'player', amount: 40 });
    expect(next.phase).toBe('player_choose');
  });

  it('clamps player HP at zero and ends the battle on a killing blow', () => {
    const state = makeBattleState({ playerHp: 20 });
    const next = applyEnemyAttack(state, 50, 10, 1);

    expect(next.playerHp).toBe(0);
    expect(next.phase).toBe('battle_lost');
  });

  it('halves incoming damage with a Brain Shield multiplier', () => {
    const next = applyEnemyAttack(makeBattleState(), 50, 10, 0.5);

    expect(next.lastDamage).toEqual({ target: 'player', amount: 20 });
    expect(next.playerHp).toBe(80);
  });
});
