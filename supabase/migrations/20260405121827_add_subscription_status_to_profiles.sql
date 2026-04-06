/*
  # Add subscription_status to profiles

  1. Modified Tables
    - `profiles`
      - `subscription_status` (text, default 'free') - Tracks the subscription lifecycle state:
        - 'free' = no active subscription
        - 'active' = paying subscriber, auto-renews
        - 'cancelling' = subscriber cancelled but premium remains until period end
  
  2. Security
    - Existing RLS policies cover this column (users can read their own profile)
  
  3. Notes
    - This column enables the UI to distinguish between an active subscriber
      and one who has cancelled but still has time remaining on their billing period.
    - The cancel and reactivate edge functions will update this value.
    - The webhook also updates it on relevant Stripe events.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text NOT NULL DEFAULT 'free';
  END IF;
END $$;

UPDATE profiles
SET subscription_status = 'active'
WHERE is_premium = true
  AND subscription_status = 'free';
