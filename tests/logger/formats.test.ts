import { describe, expect, it } from 'vitest';
import { serializeEvent, shouldLog, toIsoTimestamp } from '../../src/lib/logger/formats';

describe('toIsoTimestamp', () => {
  it('formats dates as ISO strings', () => {
    expect(toIsoTimestamp(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('shouldLog', () => {
  it('filters events below the configured level', () => {
    expect(shouldLog('debug', 'info')).toBe(false);
    expect(shouldLog('info', 'info')).toBe(true);
    expect(shouldLog('warn', 'info')).toBe(true);
    expect(shouldLog('error', 'warn')).toBe(true);
  });
});

describe('serializeEvent', () => {
  it('serializes an event to a single JSON line', () => {
    const event = {
      type: 'battle.victory' as const,
      level: 'info' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { enemyName: 'Bugzoid Grunt', isBoss: false, expGained: 18 },
    };

    expect(serializeEvent(event)).toBe(
      '{"type":"battle.victory","level":"info","ts":"2026-01-01T00:00:00.000Z","data":{"enemyName":"Bugzoid Grunt","isBoss":false,"expGained":18}}'
    );
  });

  it('escapes quotes and preserves unicode', () => {
    const event = {
      type: 'auth.login.failure' as const,
      level: 'warn' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { method: 'email' as const, message: 'Invalid "credentials" — try again' },
    };

    const line = serializeEvent(event);
    expect(line).toContain('Invalid \\"credentials\\"');
    expect(JSON.parse(line).data.message).toBe('Invalid "credentials" — try again');
  });
});
