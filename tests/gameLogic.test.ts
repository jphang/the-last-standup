import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PlayerCharacter } from '../src/types/game';
import {
  CLASS_GROWTHS,
  calculateDamage,
  calculateExpGain,
  getEffectiveStats,
  processLevelUp,
} from '../src/lib/gameLogic';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('calculateDamage', () => {
  it('deals base damage when attack beats defense', () => {
    expect(calculateDamage(50, 10)).toBe(40);
  });

  it('floors to 20% of attack when defense exceeds the raw gap', () => {
    expect(calculateDamage(50, 60)).toBe(10);
  });

  it('applies a multiplier for Knowledge Strike (double damage)', () => {
    expect(calculateDamage(50, 10, 2)).toBe(80);
  });

  it('applies a multiplier for Brain Shield (halved damage)', () => {
    expect(calculateDamage(50, 10, 0.5)).toBe(20);
  });

  it('never deals less than 1 damage', () => {
    expect(calculateDamage(0, 100)).toBe(1);
    expect(calculateDamage(5, 100)).toBe(1);
  });
});

describe('calculateExpGain', () => {
  it('awards the base amount when levels are equal', () => {
    expect(calculateExpGain(1, 1, false)).toBe(18);
  });

  it('gives a bonus when the enemy outlevels the player', () => {
    expect(calculateExpGain(1, 3, false)).toBe(34);
  });

  it('does not penalize when the player outlevels the enemy', () => {
    expect(calculateExpGain(5, 3, false)).toBe(24);
  });

  it('adds the boss bonus for boss fights', () => {
    expect(calculateExpGain(3, 4, true)).toBe(57);
  });

  it('caps EXP at 99', () => {
    expect(calculateExpGain(1, 50, true)).toBe(99);
  });
});

describe('processLevelUp', () => {
  it('levels up exactly once for 100 EXP', () => {
    const result = processLevelUp(makeCharacter({ exp: 0 }), 100);
    expect(result.levelsGained).toBe(1);
    expect(result.newLevel).toBe(2);
    expect(result.newExp).toBe(0);
  });

  it('levels up multiple times and carries over leftover EXP', () => {
    const result = processLevelUp(makeCharacter({ exp: 30 }), 220);
    expect(result.levelsGained).toBe(2);
    expect(result.newLevel).toBe(3);
    expect(result.newExp).toBe(50);
  });

  it('returns no changes when no EXP is gained', () => {
    const result = processLevelUp(makeCharacter({ exp: 0 }), 0);
    expect(result.levelsGained).toBe(0);
    expect(result.newLevel).toBe(1);
    expect(result.newExp).toBe(0);
    expect(result.hpGain).toBe(0);
    expect(result.attackGain).toBe(0);
    expect(result.defenseGain).toBe(0);
  });

  it('applies stat gains within the class growth range on min rolls', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = processLevelUp(makeCharacter(), 100);
    expect(result.hpGain).toBe(CLASS_GROWTHS.ceo.hp[0]);
    expect(result.attackGain).toBe(CLASS_GROWTHS.ceo.atk[0]);
    expect(result.defenseGain).toBe(CLASS_GROWTHS.ceo.def[0]);
  });

  it('applies stat gains within the class growth range on max rolls', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    const result = processLevelUp(makeCharacter(), 100);
    expect(result.hpGain).toBe(CLASS_GROWTHS.ceo.hp[1]);
    expect(result.attackGain).toBe(CLASS_GROWTHS.ceo.atk[1]);
    expect(result.defenseGain).toBe(CLASS_GROWTHS.ceo.def[1]);
  });

  it('scales gains per level for multi-level ups', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = processLevelUp(makeCharacter(), 200);
    expect(result.levelsGained).toBe(2);
    expect(result.hpGain).toBe(CLASS_GROWTHS.ceo.hp[0] * 2);
    expect(result.attackGain).toBe(CLASS_GROWTHS.ceo.atk[0] * 2);
    expect(result.defenseGain).toBe(CLASS_GROWTHS.ceo.def[0] * 2);
  });

  it('falls back to intern growths for an unknown character key', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    const result = processLevelUp(makeCharacter({ character_key: 'mystery' }), 100);
    expect(result.hpGain).toBe(CLASS_GROWTHS.intern.hp[1]);
    expect(result.attackGain).toBe(CLASS_GROWTHS.intern.atk[1]);
    expect(result.defenseGain).toBe(CLASS_GROWTHS.intern.def[1]);
  });
});

describe('getEffectiveStats', () => {
  it('returns base stats for free players', () => {
    expect(getEffectiveStats(makeCharacter(), false)).toEqual({
      hp: 50,
      attack: 12,
      defense: 8,
    });
  });

  it('triples stats for premium players', () => {
    expect(getEffectiveStats(makeCharacter(), true)).toEqual({
      hp: 150,
      attack: 36,
      defense: 24,
    });
  });
});
