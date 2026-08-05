import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import * as logger from '../src/lib/logger';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      refreshSession: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

type SessionResponse = Awaited<ReturnType<typeof supabase.auth.refreshSession>>;

import { supabase } from '../src/lib/supabase';
import {
  cancelSubscription,
  reactivateSubscription,
  startCheckout,
  verifyPremium,
} from '../src/lib/stripe';

const mockedRefreshSession = vi.mocked(supabase.auth.refreshSession);
const mockedGetSession = vi.mocked(supabase.auth.getSession);

function makeSession(): Session {
  return {
    access_token: 'test-token',
    expires_at: 9999999999,
    expires_in: 3600,
    refresh_token: 'test-refresh',
    token_type: 'bearer',
    user: { id: 'user-1' } as unknown as User,
  } as unknown as Session;
}

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function badResponse(body: unknown, status = 400) {
  return {
    ok: false,
    status,
    json: async () => body,
  } as Response;
}

function mockActiveSession() {
  const session = makeSession();
  mockedRefreshSession.mockResolvedValue({
    data: { user: session.user, session },
    error: null,
  } as unknown as SessionResponse);
}

function mockGetSession() {
  const session = makeSession();
  mockedGetSession.mockResolvedValue({
    data: { session },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('window', { location: { origin: 'https://app.example.com' } });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('verifyPremium', () => {
  it('reports premium when Stripe verification finds an active subscription', async () => {
    mockActiveSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({ is_premium: true, premium_expires_at: '2026-12-31T00:00:00Z' })
    );

    await expect(verifyPremium()).resolves.toEqual({
      is_premium: true,
      premium_expires_at: '2026-12-31T00:00:00Z',
    });
  });

  it('calls the stripe-verify endpoint with the user access token', async () => {
    mockActiveSession();
    const fetched = (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({ is_premium: false })
    );

    await verifyPremium();

    const url = fetched.mock.calls[0][0] as string;
    expect(url).toContain('/functions/v1/stripe-verify');
    expect(fetched.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer test-token'
    );
  });

  it('returns is_premium false when the subscription lookup comes back empty', async () => {
    mockActiveSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({ is_premium: false })
    );

    await expect(verifyPremium()).resolves.toEqual({ is_premium: false });
  });

  it('does not throw and reports false when the fetch fails', async () => {
    mockActiveSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network down')
    );

    await expect(verifyPremium()).resolves.toEqual({ is_premium: false });
  });

  it('returns false when there is no active session', async () => {
    mockedRefreshSession.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'no session' },
    } as unknown as SessionResponse);

    await expect(verifyPremium()).resolves.toEqual({ is_premium: false });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('startCheckout', () => {
  it('logs a checkout_started event with the user id', async () => {
    mockGetSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({ url: 'https://checkout.stripe.com/c/123' })
    );
    const logSpy = vi.spyOn(logger, 'log');

    await expect(startCheckout()).resolves.toBe(
      'https://checkout.stripe.com/c/123'
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'premium.checkout_started',
        level: 'info',
        userId: 'user-1',
      })
    );
  });
});

describe('cancelSubscription', () => {
  it('logs a cancelled event with the expiry date', async () => {
    mockGetSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({
        cancelled: true,
        expires_at: '2026-08-31T00:00:00Z',
      })
    );
    const logSpy = vi.spyOn(logger, 'log');

    const result = await cancelSubscription();
    expect(result.cancelled).toBe(true);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'premium.cancelled',
        level: 'info',
        userId: 'user-1',
        data: { expiresAt: '2026-08-31T00:00:00Z' },
      })
    );
  });

  it('logs an error and throws when cancellation fails', async () => {
    mockGetSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      badResponse({ error: 'No active subscription found' })
    );
    const logSpy = vi.spyOn(logger, 'log');

    await expect(cancelSubscription()).rejects.toThrow(
      'No active subscription found'
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'premium.error',
        level: 'warn',
        userId: 'user-1',
        data: { error: 'No active subscription found' },
      })
    );
  });
});

describe('reactivateSubscription', () => {
  it('logs a reactivated event with the renewal date', async () => {
    mockGetSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      okResponse({
        reactivated: true,
        renews_at: '2026-09-30T00:00:00Z',
      })
    );
    const logSpy = vi.spyOn(logger, 'log');

    const result = await reactivateSubscription();
    expect(result.reactivated).toBe(true);

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'premium.reactivated',
        level: 'info',
        userId: 'user-1',
        data: { renewsAt: '2026-09-30T00:00:00Z' },
      })
    );
  });

  it('logs an error and throws when reactivation fails', async () => {
    mockGetSession();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      badResponse({
        error: 'Subscription is not pending cancellation',
      })
    );
    const logSpy = vi.spyOn(logger, 'log');

    await expect(reactivateSubscription()).rejects.toThrow(
      'Subscription is not pending cancellation'
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'premium.error',
        level: 'warn',
        userId: 'user-1',
        data: { error: 'Subscription is not pending cancellation' },
      })
    );
  });
});