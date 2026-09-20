// @vitest-environment jsdom
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlayerCharacter, TriviaQuestion } from '../src/types/game';
import { useBattleFlow } from '../src/hooks/useBattleFlow';

const { fromMock, updateMock, eqMock } = vi.hoisted(() => {
  const eqMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ update: updateMock }));
  return { fromMock, updateMock, eqMock };
});

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: fromMock },
}));

const { getCSQuestionMock, getMathQuestionMock, prefetchQuestionsMock } = vi.hoisted(() => ({
  getCSQuestionMock: vi.fn(),
  getMathQuestionMock: vi.fn(),
  prefetchQuestionsMock: vi.fn(),
}));

vi.mock('../src/lib/trivia', () => ({
  getCSQuestion: getCSQuestionMock,
  getMathQuestion: getMathQuestionMock,
  prefetchQuestions: prefetchQuestionsMock,
}));

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

function makeQuestion(overrides: Partial<TriviaQuestion> = {}): TriviaQuestion {
  return {
    question: 'What does CPU stand for?',
    correct_answer: 'Central Processing Unit',
    incorrect_answers: ['RAM', 'GPU', 'HDD'],
    difficulty: 'easy',
    type: 'multiple',
    category: 'Science: Computers',
    ...overrides,
  };
}

function renderBattleFlow(options: Parameters<typeof useBattleFlow>[0]) {
  const container = document.createElement('div');
  const root: Root = createRoot(container);
  let result!: ReturnType<typeof useBattleFlow>;

  function Host(props: typeof options) {
    result = useBattleFlow(props);
    return null;
  }

  act(() => {
    root.render(createElement(Host, options));
  });

  return {
    get current() {
      return result;
    },
    unmount: () => act(() => root.unmount()),
  };
}

// Lets pending fire-and-forget promises (e.g. handleVictory/handleDefeat's internal
// `await supabase...update()`) settle before asserting on their side effects.
async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  fromMock.mockClear();
  updateMock.mockClear();
  eqMock.mockClear();
  getCSQuestionMock.mockReset();
  getMathQuestionMock.mockReset();
  prefetchQuestionsMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mount behavior', () => {
  it('auto-starts a normal battle for a non-boss-eligible character', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const harness = renderBattleFlow({ character: makeCharacter({ level: 1 }), isPremium: false });

    expect(harness.current.battle?.phase).toBe('player_choose');
    expect(harness.current.battle?.enemy.name).toBe('Bugzoid Grunt');
    expect(harness.current.choosing).toBe(false);
    expect(prefetchQuestionsMock).toHaveBeenCalled();
  });
});

describe('handleAttack', () => {
  it('presents a trivia question when one is available', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const question = makeQuestion();
    getCSQuestionMock.mockResolvedValue(question);

    const harness = renderBattleFlow({ character: makeCharacter({ level: 1 }), isPremium: false });

    await act(async () => {
      await harness.current.handleAttack();
    });

    expect(harness.current.battle?.phase).toBe('trivia_attack');
    expect(harness.current.showTrivia).toBe(true);
    expect(harness.current.battle?.currentQuestion).toEqual(question);
  });

  it('falls back to a normal attack when no trivia question is available', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getCSQuestionMock.mockResolvedValue(null);

    const harness = renderBattleFlow({ character: makeCharacter({ level: 1 }), isPremium: false });

    await act(async () => {
      await harness.current.handleAttack();
    });

    // grunt defense=7, player attack=12: base=2, raw=max(2,5)=5, dmg=5 -> 46-5
    expect(harness.current.battle?.enemy.hp).toBe(41);
    expect(harness.current.battle?.phase).toBe('enemy_incoming');
  });
});

describe('handleTriviaAnswer', () => {
  it('deals double damage on a correct attack answer', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getCSQuestionMock.mockResolvedValue(makeQuestion());

    const harness = renderBattleFlow({ character: makeCharacter({ level: 1 }), isPremium: false });

    await act(async () => {
      await harness.current.handleAttack();
    });

    act(() => {
      harness.current.handleTriviaAnswer(true);
    });

    // grunt defense=7, player attack=12, x2 multiplier: raw=5, dmg=10 -> 46-10
    expect(harness.current.battle?.enemy.hp).toBe(36);
  });
});

describe('victory flow', () => {
  it('ends the battle, computes EXP, and persists the correct payload to Supabase', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getCSQuestionMock.mockResolvedValue(null);

    const harness = renderBattleFlow({
      character: makeCharacter({ level: 1, attack: 200 }),
      isPremium: false,
    });

    await act(async () => {
      await harness.current.handleAttack();
    });
    await flushPromises();

    expect(harness.current.battle?.phase).toBe('battle_won');
    expect(harness.current.battle?.expGained).toBe(18);
    expect(fromMock).toHaveBeenCalledWith('player_characters');
    expect(updateMock).toHaveBeenCalledWith({
      level: 1,
      exp: 18,
      max_hp: 50,
      current_hp: 50,
      attack: 200,
      defense: 8,
      battles_won: 1,
      boss_defeats: 0,
      updated_at: expect.any(String),
    });
    expect(eqMock).toHaveBeenCalledWith('id', 'char-1');
  });

  it('increments boss_defeats and shows the boss victory screen on a boss kill', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getCSQuestionMock.mockResolvedValue(null);

    const harness = renderBattleFlow({
      character: makeCharacter({ level: 1, attack: 200 }),
      isPremium: false,
    });

    act(() => {
      harness.current.beginBattle(true);
    });

    await act(async () => {
      await harness.current.handleAttack();
    });
    await flushPromises();

    expect(harness.current.showBossVictory).toBe(true);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ boss_defeats: 1 }),
    );
  });
});

describe('defeat flow', () => {
  it('ends the battle and persists battles_lost to Supabase', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getMathQuestionMock.mockResolvedValue(null);

    const harness = renderBattleFlow({
      character: makeCharacter({ level: 1, defense: 0, max_hp: 1, current_hp: 1 }),
      isPremium: false,
    });

    await act(async () => {
      await harness.current.handleDefend();
    });
    await flushPromises();

    expect(harness.current.battle?.phase).toBe('battle_lost');
    expect(fromMock).toHaveBeenCalledWith('player_characters');
    expect(updateMock).toHaveBeenCalledWith({
      battles_lost: 1,
      updated_at: expect.any(String),
    });
    expect(eqMock).toHaveBeenCalledWith('id', 'char-1');
  });
});
