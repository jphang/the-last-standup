import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateEnemy, isBossEligible } from '../src/lib/enemies';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isBossEligible', () => {
  it('returns true at level 3 or higher', () => {
    expect(isBossEligible(3)).toBe(true);
    expect(isBossEligible(10)).toBe(true);
  });

  it('returns false below level 3', () => {
    expect(isBossEligible(2)).toBe(false);
    expect(isBossEligible(0)).toBe(false);
  });
});

describe('generateEnemy', () => {
  it('picks a grunt template and rolls deterministic min stats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const enemy = generateEnemy(1);

    expect(enemy.name).toBe('Bugzoid Grunt');
    expect(enemy.isBoss).toBe(false);
    expect(enemy.spriteKey).toBe('alien');
    expect(enemy.level).toBe(1);
    expect(enemy.hp).toBe(46);
    expect(enemy.attack).toBe(10);
    expect(enemy.defense).toBe(7);
    expect(enemy.maxHp).toBe(enemy.hp);
  });

  it('picks the last grunt template and rolls deterministic max stats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    const enemy = generateEnemy(1);

    expect(enemy.name).toBe('Merge Conflicton');
    expect(enemy.level).toBe(2);
    expect(enemy.hp).toBe(55);
    expect(enemy.attack).toBe(14);
    expect(enemy.defense).toBe(10);
  });

  it('scales enemy level within one level of the player', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateEnemy(5).level).toBe(4);

    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    expect(generateEnemy(5).level).toBe(6);
  });

  it('never drops enemy level below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateEnemy(1).level).toBe(1);
  });

  it('always respects stat floors', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    let enemy = generateEnemy(1);
    expect(enemy.hp).toBeGreaterThanOrEqual(10);
    expect(enemy.attack).toBeGreaterThanOrEqual(3);
    expect(enemy.defense).toBeGreaterThanOrEqual(1);

    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    enemy = generateEnemy(1);
    expect(enemy.hp).toBeGreaterThanOrEqual(10);
    expect(enemy.attack).toBeGreaterThanOrEqual(3);
    expect(enemy.defense).toBeGreaterThanOrEqual(1);
  });

  it('forces the boss and boosts its level by one', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const enemy = generateEnemy(1, true);

    expect(enemy.name).toBe('Dr. Marcus Pivot');
    expect(enemy.title).toBe('The Traitor CTO');
    expect(enemy.isBoss).toBe(true);
    expect(enemy.spriteKey).toBe('alien');
    expect(enemy.level).toBe(2);
    expect(enemy.hp).toBe(65);
    expect(enemy.attack).toBe(15);
    expect(enemy.defense).toBe(10);
  });
});
