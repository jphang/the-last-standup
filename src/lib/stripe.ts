import { supabase } from './supabase';

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
  return data.url as string;
}

export async function verifyPremium(): Promise<{
  is_premium: boolean;
  premium_expires_at?: string;
}> {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error || !session) return { is_premium: false };

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
  );

  if (!res.ok) return { is_premium: false };
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
    throw new Error(data?.error || `Cancellation failed (${res.status})`);
  }

  return res.json();
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
    throw new Error(data?.error || `Reactivation failed (${res.status})`);
  }

  return res.json();
}
