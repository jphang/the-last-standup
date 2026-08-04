import { describe, expect, it } from 'vitest';
import {
  formatEvent,
  formatEventHumanReadable,
  serializeEvent,
  shouldLog,
  toIsoTimestamp,
} from '../../src/lib/logger/formats';

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

describe('formatEventHumanReadable', () => {
  it('puts the timestamp on the left, then level, context, type, and data', () => {
    const event = {
      type: 'battle.victory' as const,
      level: 'info' as const,
      ts: '2026-01-01T00:00:00.000Z',
      userId: 'user-1',
      data: { enemyName: 'Bugzoid Grunt', isBoss: false, expGained: 18 },
    };

    expect(formatEventHumanReadable(event)).toBe(
      '2026-01-01T00:00:00.000Z INFO  [user-1] battle.victory enemyName="Bugzoid Grunt" isBoss=false expGained=18'
    );
  });

  it('quotes logfmt values that contain spaces or special characters', () => {
    const event = {
      type: 'auth.login.failure' as const,
      level: 'warn' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { method: 'email' as const, message: 'Invalid "credentials" — try again' },
    };

    const line = formatEventHumanReadable(event);
    expect(line).toContain('message="Invalid \\"credentials\\" — try again"');
    expect(line).toContain('method=email');
  });

  it('omits the userId and empty data sections when absent', () => {
    const event = {
      type: 'auth.logout' as const,
      level: 'info' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: {},
    };

    expect(formatEventHumanReadable(event)).toBe('2026-01-01T00:00:00.000Z INFO  auth.logout');
  });

  it('formats warn and error levels with consistent padding', () => {
    const warn = {
      type: 'battle.defeat' as const,
      level: 'warn' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { enemyName: 'Bugzoid Grunt', isBoss: false },
    };
    const error = {
      type: 'trivia.error' as const,
      level: 'error' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { category: 'cs' as const, count: 0 },
    };

    expect(formatEventHumanReadable(warn)).toMatch(/ WARN {2}battle\.defeat/);
    expect(formatEventHumanReadable(error)).toMatch(/ ERROR trivia\.error/);
  });
});

describe('formatEvent', () => {
  it('defaults to the human-readable format', () => {
    const event = {
      type: 'battle.start' as const,
      level: 'info' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { characterId: 'char-1', enemyName: 'Bugzoid Grunt', isBoss: false, playerLevel: 1 },
    };

    expect(formatEvent(event)).toBe(formatEventHumanReadable(event));
    expect(formatEvent(event, 'json')).toBe(serializeEvent(event));
  });
});

describe('trivia.presented', () => {
  const event = {
    type: 'trivia.presented' as const,
    level: 'debug' as const,
    ts: '2026-01-01T00:00:00.000Z',
    userId: 'user-1',
    data: {
      category: 'cs' as const,
      phase: 'attack' as const,
      question: 'What does HTTP stand for?',
      correctAnswer: 'HyperText Transfer Protocol',
      options: ['HyperText Transfer Protocol', 'High Test Transfer Protocol', 'HyperText Transfer Process'],
    },
  };

  it('round-trips the full payload through JSON', () => {
    expect(JSON.parse(serializeEvent(event)).data).toEqual(event.data);
  });

  it('renders a human-readable line with the question, answer, and options', () => {
    expect(formatEventHumanReadable(event)).toBe(
      '2026-01-01T00:00:00.000Z DEBUG [user-1] trivia.presented category=cs phase=attack ' +
        'question="What does HTTP stand for?" correctAnswer="HyperText Transfer Protocol" ' +
        'options="HyperText Transfer Protocol,High Test Transfer Protocol,HyperText Transfer Process"'
    );
  });
});

describe('trivia.answer', () => {
  it('renders correct, non-timed-out answers with the applied multiplier', () => {
    const event = {
      type: 'trivia.answer' as const,
      level: 'debug' as const,
      ts: '2026-01-01T00:00:00.000Z',
      userId: 'user-1',
      data: { category: 'cs' as const, phase: 'attack' as const, correct: true, timedOut: false, multiplier: 2 },
    };

    expect(formatEventHumanReadable(event)).toBe(
      '2026-01-01T00:00:00.000Z DEBUG [user-1] trivia.answer category=cs phase=attack correct=true timedOut=false multiplier=2'
    );
  });

  it('renders timed-out answers as incorrect with normal damage', () => {
    const event = {
      type: 'trivia.answer' as const,
      level: 'debug' as const,
      ts: '2026-01-01T00:00:00.000Z',
      data: { category: 'math' as const, phase: 'defend' as const, correct: false, timedOut: true, multiplier: 1 },
    };

    expect(formatEventHumanReadable(event)).toBe(
      '2026-01-01T00:00:00.000Z DEBUG trivia.answer category=math phase=defend correct=false timedOut=true multiplier=1'
    );
  });
});
