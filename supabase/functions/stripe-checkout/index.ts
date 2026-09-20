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
        JSON.stringify({
          error: "Stripe is not configured. Please add STRIPE_SECRET_KEY.",
        }),
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const { successUrl, cancelUrl } = await req.json();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const prices = await stripe.prices.list({
      lookup_keys: ["paying_to_win_monthly"],
      active: true,
      limit: 1,
    });

    let priceId: string;
    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: "Paying to Win - Premium Tier",
        description:
          "Triple all character stats. Top hat, monocle, and fake mustache included.",
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 299,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: "paying_to_win_monthly",
      });
      priceId = price.id;
    }

    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    for (const sub of existingSubs.data) {
      if (sub.status === "incomplete" || sub.status === "incomplete_expired") {
        await stripe.subscriptions.cancel(sub.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || "http://localhost:5173?premium=success",
      cancel_url: cancelUrl || "http://localhost:5173?premium=cancel",
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: jsonHeaders,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
});
