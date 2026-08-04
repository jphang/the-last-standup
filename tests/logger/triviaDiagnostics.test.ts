import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from '../../src/lib/logger';
import { getCSQuestion } from '../../src/lib/trivia';

vi.mock('../../src/lib/logger', () => ({ log: vi.fn() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('trivia.error diagnostics', () => {
  it('records the API response code when OpenTDB reports a failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ response_code: 5, results: [] }) })
    );

    await getCSQuestion();

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'trivia.error',
        level: 'warn',
        data: expect.objectContaining({ category: 'cs', count: 0, responseCode: 5 }),
      })
    );
  });

  it('records the error message when the fetch itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await getCSQuestion();

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'trivia.error',
        level: 'warn',
        data: expect.objectContaining({ category: 'cs', count: 0, reason: 'network down' }),
      })
    );
  });
});
