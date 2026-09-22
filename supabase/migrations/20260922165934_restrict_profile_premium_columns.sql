/*
# Restrict client writes to premium/subscription columns on profiles

## Problem
The `update_own_profile` RLS policy on `public.profiles` only checks row ownership
(`auth.uid() = id`) — it does not restrict which columns an authenticated user may write.
Combined with Supabase's default blanket UPDATE grant to the `authenticated` role, any
signed-in user could previously run the following directly from the browser (no code
modification required) and grant themselves premium for free, bypassing Stripe entirely:

  supabase.from('profiles')
    .update({ is_premium: true, subscription_status: 'active' })
    .eq('id', user.id)

## Fix
Only `display_name`, `avatar_url`, and `updated_at` are legitimately user-editable.
`is_premium`, `premium_expires_at`, `stripe_customer_id`, and `subscription_status` must only
ever be written by the Stripe edge functions (`stripe-webhook`, `stripe-verify`, `stripe-cancel`,
`stripe-reactivate`), which use the service-role key and therefore bypass RLS and these
column-level grants entirely — so their behavior is unaffected by this change.

This revokes blanket UPDATE on `profiles` from `authenticated` and re-grants it column-by-column.
Postgres enforces both the row-level RLS policy and column-level grants together, so the existing
`update_own_profile` policy does not need to change.
*/

REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (display_name, avatar_url, updated_at)
  ON public.profiles
  TO authenticated;
