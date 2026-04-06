import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

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
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
