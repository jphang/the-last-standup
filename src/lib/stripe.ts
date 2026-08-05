import { supabase } from './supabase';
import { log } from './logger';

export async function startCheckout() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User must be authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        successUrl: `${window.location.origin}?premium=success`,
        cancelUrl: `${window.location.origin}?premium=cancel`,
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Checkout failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.url) throw new Error('No checkout URL returned');

  log({
    type: 'premium.checkout_started',
    level: 'info',
    ts: new Date().toISOString(),
    userId: session.user.id,
    data: {},
  });

  return data.url as string;
}

export async function verifyPremium(): Promise<{
  is_premium: boolean;
  premium_expires_at?: string;
}> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    log({
      type: 'premium.verify',
      level: 'warn',
      ts: new Date().toISOString(),
      data: { isPremium: false, error: error?.message ?? 'No active session' },
    });
    return { is_premium: false };
  }

  const session = data.session;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-verify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    }
  ).catch(() => null);

  if (!res) {
    log({
      type: 'premium.error',
      level: 'warn',
      ts: new Date().toISOString(),
      userId: session.user.id,
      data: { error: 'Network error during premium verification' },
    });
    return { is_premium: false };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    log({
      type: 'premium.error',
      level: 'warn',
      ts: new Date().toISOString(),
      userId: session.user.id,
      data: { error: body?.error ?? `Premium verification failed (${res.status})` },
    });
    return { is_premium: false };
  }

  return res.json();
}

export async function cancelSubscription(): Promise<{
  cancelled: boolean;
  expires_at?: string;
  error?: string;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User must be authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.error || `Cancellation failed (${res.status})`;
    log({
      type: 'premium.error',
      level: 'warn',
      ts: new Date().toISOString(),
      userId: session.user.id,
      data: { error: message },
    });
    throw new Error(message);
  }

  const result = await res.json();

  log({
    type: 'premium.cancelled',
    level: 'info',
    ts: new Date().toISOString(),
    userId: session.user.id,
    data: { expiresAt: result.expires_at ?? null },
  });

  return result;
}

export async function reactivateSubscription(): Promise<{
  reactivated: boolean;
  renews_at?: string;
  error?: string;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User must be authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-reactivate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.error || `Reactivation failed (${res.status})`;
    log({
      type: 'premium.error',
      level: 'warn',
      ts: new Date().toISOString(),
      userId: session.user.id,
      data: { error: message },
    });
    throw new Error(message);
  }

  const result = await res.json();

  log({
    type: 'premium.reactivated',
    level: 'info',
    ts: new Date().toISOString(),
    userId: session.user.id,
    data: { renewsAt: result.renews_at ?? null },
  });

  return result;
}
