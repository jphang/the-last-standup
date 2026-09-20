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
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabase = createServiceRoleClient();

    const authResult = await requireAuthenticatedUser(req, supabase);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, is_premium, premium_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profile?.is_premium &&
      profile.premium_expires_at &&
      new Date(profile.premium_expires_at) > new Date()
    ) {
      return new Response(
        JSON.stringify({
          is_premium: true,
          premium_expires_at: profile.premium_expires_at,
        }),
        { headers: jsonHeaders }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    }

    if (!customerId) {
      return new Response(JSON.stringify({ is_premium: false }), {
        headers: jsonHeaders,
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      const trialingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });
      if (trialingSubs.data.length > 0) {
        subscriptions.data.push(trialingSubs.data[0]);
      }
    }

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const expiresAt = new Date(
        sub.current_period_end * 1000
      ).toISOString();

      const subStatus = sub.cancel_at_period_end ? "cancelling" : "active";

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires_at: expiresAt,
          subscription_status: subStatus,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[stripe-verify] Failed to update profile:", updateError.message, { userId: user.id, customerId });
        return new Response(
          JSON.stringify({
            error: `Failed to activate premium: ${updateError.message}`,
          }),
          { status: 500, headers: jsonHeaders }
        );
      }

      return new Response(
        JSON.stringify({ is_premium: true, premium_expires_at: expiresAt }),
        { headers: jsonHeaders }
      );
    }

    return new Response(JSON.stringify({ is_premium: false }), {
      headers: jsonHeaders,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[stripe-verify] Unhandled error:", message);
    return errorResponse(error);
  }
});
