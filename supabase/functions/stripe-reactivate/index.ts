import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { handlePreflight, jsonHeaders } from "../_shared/cors.ts";
import { createServiceRoleClient, requireAuthenticatedUser } from "../_shared/auth.ts";
import { errorResponse } from "../_shared/errors.ts";

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        {
          status: 500,
          headers: jsonHeaders,
        }
      );
    }

    const supabase = createServiceRoleClient();

    const authResult = await requireAuthenticatedUser(req, supabase);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: jsonHeaders,
        }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: jsonHeaders,
        }
      );
    }

    const subscription = subscriptions.data[0];

    if (!subscription.cancel_at_period_end) {
      return new Response(
        JSON.stringify({ error: "Subscription is not pending cancellation" }),
        {
          status: 400,
          headers: jsonHeaders,
        }
      );
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return new Response(
      JSON.stringify({
        reactivated: true,
        renews_at: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      }),
      {
        headers: jsonHeaders,
      }
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
});
