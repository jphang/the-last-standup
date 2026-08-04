// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TriviaQuestion } from '../src/types/game';
import { getCSQuestion, getMathQuestion, prefetchQuestions } from '../src/lib/trivia';

function mockFetchWithResults(results: TriviaQuestion[], responseCode = 0) {
  const fetchMock = vi.fn().mockResolvedValue({
    json: async () => ({ response_code: responseCode, results }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function makeQuestion(overrides: Partial<TriviaQuestion> = {}): TriviaQuestion {
  return {
    question: 'What does CPU stand for?',
    correct_answer: 'Central Processing Unit',
    incorrect_answers: ['Random Access Memory', 'Graphics Card', 'Hard Drive'],
    difficulty: 'easy',
    type: 'multiple',
    category: 'Science: Computers',
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getCSQuestion', () => {
  it('fetches computer science questions from the Open Trivia Database', async () => {
    const fetchMock = mockFetchWithResults([makeQuestion()]);

    const question = await getCSQuestion();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://opentdb.com/api.php?amount=50&category=18&type=multiple'
    );
    expect(question).toEqual(makeQuestion());
  });

  it('decodes HTML entities in the question and answers', async () => {
    mockFetchWithResults([
      makeQuestion({
        question: 'What &amp; why is 2 &lt; 3?',
        correct_answer: 'Because &quot;math&quot;',
        incorrect_answers: ['A &amp; B', 'C', 'D'],
        category: 'General &amp; Knowledge',
      }),
    ]);

    const question = await getCSQuestion();

    expect(question?.question).toBe('What & why is 2 < 3?');
    expect(question?.correct_answer).toBe('Because "math"');
    expect(question?.incorrect_answers[0]).toBe('A & B');
    expect(question?.category).toBe('General & Knowledge');
  });

  it('returns null when the API reports a non-zero response code', async () => {
    mockFetchWithResults([], 1);
    await expect(getCSQuestion()).resolves.toBeNull();
  });

  it('returns null instead of throwing when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(getCSQuestion()).resolves.toBeNull();
  });
});

describe('getMathQuestion', () => {
  it('fetches math questions from the Open Trivia Database', async () => {
    const fetchMock = mockFetchWithResults([
      makeQuestion({ category: 'Science: Mathematics' }),
    ]);

    const question = await getMathQuestion();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://opentdb.com/api.php?amount=50&category=19&type=multiple'
    );
    expect(question?.category).toBe('Science: Mathematics');
  });
});

describe('prefetchQuestions', () => {
  it('kicks off fetches for both computer science and math questions', () => {
    const fetchMock = mockFetchWithResults([makeQuestion()]);

    prefetchQuestions();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://opentdb.com/api.php?amount=50&category=18&type=multiple'
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://opentdb.com/api.php?amount=50&category=19&type=multiple'
    );
  });
});
