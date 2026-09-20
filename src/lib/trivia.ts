import type { TriviaQuestion } from '../types/game';
import { log } from './logger';

interface CategoryState {
  categoryId: number;
  queue: TriviaQuestion[];
  fetching: boolean;
}

const categories: Record<'cs' | 'math', CategoryState> = {
  cs: { categoryId: 18, queue: [], fetching: false },
  math: { categoryId: 19, queue: [], fetching: false },
};

function categoryLabel(category: number): 'cs' | 'math' {
  return category === 18 ? 'cs' : 'math';
}

function decodeHtml(html: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

function decodeQuestion(raw: TriviaQuestion): TriviaQuestion {
  return {
    ...raw,
    question: decodeHtml(raw.question),
    correct_answer: decodeHtml(raw.correct_answer),
    incorrect_answers: raw.incorrect_answers.map(decodeHtml),
    category: decodeHtml(raw.category),
  };
}

async function fetchQuestions(category: number): Promise<TriviaQuestion[]> {
  const label = categoryLabel(category);
  try {
    const res = await fetch(
      `https://opentdb.com/api.php?amount=50&category=${category}&type=multiple`
    );
    const data = await res.json();
    if (data.response_code === 0 && data.results) {
      log({
        type: 'trivia.fetch',
        level: 'info',
        ts: new Date().toISOString(),
        data: { category: label, count: data.results.length },
      });
      return data.results.map(decodeQuestion);
    }
    log({
      type: 'trivia.error',
      level: 'warn',
      ts: new Date().toISOString(),
      data: { category: label, count: 0, responseCode: data.response_code },
    });
    return [];
  } catch (error) {
    log({
      type: 'trivia.error',
      level: 'warn',
      ts: new Date().toISOString(),
      data: { category: label, count: 0, reason: error instanceof Error ? error.message : String(error) },
    });
    return [];
  }
}

async function ensureQuestions(key: 'cs' | 'math'): Promise<void> {
  const state = categories[key];
  if (state.queue.length > 2 || state.fetching) return;
  state.fetching = true;
  const fresh = await fetchQuestions(state.categoryId);
  state.queue.push(...fresh);
  state.fetching = false;
}

async function getQuestion(key: 'cs' | 'math'): Promise<TriviaQuestion | null> {
  await ensureQuestions(key);
  return categories[key].queue.pop() ?? null;
}

export async function getCSQuestion(): Promise<TriviaQuestion | null> {
  return getQuestion('cs');
}

export async function getMathQuestion(): Promise<TriviaQuestion | null> {
  return getQuestion('math');
}

export function prefetchQuestions(): void {
  ensureQuestions('cs');
  ensureQuestions('math');
}
