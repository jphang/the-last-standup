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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const findUserId = async (
      customerId: string | null | undefined,
      metadata: Stripe.Metadata | null | undefined
    ): Promise<string | null> => {
      if (metadata?.supabase_user_id) return metadata.supabase_user_id;

      if (customerId) {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (data?.id) return data.id;

        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && customer.metadata?.supabase_user_id) {
            return customer.metadata.supabase_user_id;
          }
        } catch {
          // customer not found
        }
      }

      return null;
    };

    const activatePremium = async (
      userId: string,
      customerId: string | null | undefined,
      subscription: Stripe.Subscription
    ) => {
      const expiresAt = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      const subStatus = subscription.cancel_at_period_end
        ? "cancelling"
        : "active";

      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires_at: expiresAt,
          subscription_status: subStatus,
          stripe_customer_id: customerId || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe-webhook] activatePremium failed:", error.message, { userId, customerId });
      }
    };

    const deactivatePremium = async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_expires_at: null,
          subscription_status: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("[stripe-webhook] deactivatePremium failed:", error.message, { userId });
      }
    };

    console.log("[stripe-webhook] Processing event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.subscription) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const userId = await findUserId(customerId, session.metadata);
        console.log("[stripe-webhook] checkout.session.completed:", { userId, customerId });
        if (userId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await activatePremium(userId, customerId, subscription);
        }
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      const userId = await findUserId(customerId, subscription.metadata);
      console.log("[stripe-webhook]", event.type, ":", { userId, customerId, status: subscription.status, isActive });
      if (userId) {
        if (isActive) {
          await activatePremium(userId, customerId, subscription);
        }
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const userId = await findUserId(
          customerId,
          subscription.metadata
        );
        console.log("[stripe-webhook] invoice.paid:", { userId, customerId });
        if (userId) {
          await activatePremium(userId, customerId, subscription);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const userId = await findUserId(customerId, subscription.metadata);
      console.log("[stripe-webhook] subscription.deleted:", { userId, customerId });
      if (userId) {
        await deactivatePremium(userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: jsonHeaders,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe-webhook] Unhandled error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
});
