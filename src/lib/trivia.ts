import type { TriviaQuestion } from '../types/game';

let csQuestions: TriviaQuestion[] = [];
let mathQuestions: TriviaQuestion[] = [];
let csFetching = false;
let mathFetching = false;

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
  try {
    const res = await fetch(
      `https://opentdb.com/api.php?amount=50&category=${category}&type=multiple`
    );
    const data = await res.json();
    if (data.response_code === 0 && data.results) {
      return data.results.map(decodeQuestion);
    }
    return [];
  } catch {
    return [];
  }
}

async function ensureCSQuestions(): Promise<void> {
  if (csQuestions.length > 2 || csFetching) return;
  csFetching = true;
  const fresh = await fetchQuestions(18);
  csQuestions.push(...fresh);
  csFetching = false;
}

async function ensureMathQuestions(): Promise<void> {
  if (mathQuestions.length > 2 || mathFetching) return;
  mathFetching = true;
  const fresh = await fetchQuestions(19);
  mathQuestions.push(...fresh);
  mathFetching = false;
}

export async function getCSQuestion(): Promise<TriviaQuestion | null> {
  await ensureCSQuestions();
  return csQuestions.pop() ?? null;
}

export async function getMathQuestion(): Promise<TriviaQuestion | null> {
  await ensureMathQuestions();
  return mathQuestions.pop() ?? null;
}

export function prefetchQuestions(): void {
  ensureCSQuestions();
  ensureMathQuestions();
}
