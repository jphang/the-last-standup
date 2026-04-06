/*
  # Drop unused Stripe tables, views, and enum types

  These objects were created by a Stripe starter template but are not used
  anywhere in the application. All Stripe integration is handled through
  the `profiles` table (`stripe_customer_id`, `is_premium`, `premium_expires_at`,
  `subscription_status` columns) and Supabase edge functions.

  1. Dropped Views
    - `stripe_user_subscriptions` - joined stripe_customers + stripe_subscriptions, unused
    - `stripe_user_orders` - joined stripe_customers + stripe_orders, unused

  2. Dropped Tables
    - `stripe_orders` (12 columns, 0 rows) - unused order tracking
    - `stripe_subscriptions` (13 columns, 0 rows) - unused subscription tracking
    - `stripe_customers` (6 columns, 0 rows) - unused customer mapping

  3. Dropped Enum Types
    - `stripe_order_status` (pending, completed, canceled)
    - `stripe_subscription_status` (not_started, incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid, paused)

  4. Security
    - RLS policies on all three tables are automatically removed with the tables

  5. Important Notes
    - All three tables contained zero rows of data
    - No foreign keys, triggers, or database functions referenced these objects
    - No application code references these tables or views
*/

DROP VIEW IF EXISTS stripe_user_subscriptions;
DROP VIEW IF EXISTS stripe_user_orders;

DROP TABLE IF EXISTS stripe_orders;
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_customers;

DROP TYPE IF EXISTS stripe_order_status;
DROP TYPE IF EXISTS stripe_subscription_status;
