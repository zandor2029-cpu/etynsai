import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Plan configuration
const PLANS: Record<string, { name: string; credits: number }> = {
  'price_1StCaDDRKf7UQFHVuTxSRm0S': { name: 'basico', credits: 300 },
  'price_1StCaVDRKf7UQFHVAu1DzCHN': { name: 'pro', credits: 600 },
  'price_1StCamDRKf7UQFHVSg5MBF77': { name: 'ultimate', credits: 1200 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const body = await req.text();
    const event = JSON.parse(body);
    
    logStep("Event type", { type: event.type });

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        
        if (!subscriptionId) {
          logStep("No subscription ID in invoice, skipping");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const planInfo = PLANS[priceId];
        
        if (!planInfo) {
          logStep("Unknown price ID", { priceId });
          break;
        }

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) {
          logStep("Customer was deleted");
          break;
        }
        
        const email = customer.email;
        if (!email) {
          logStep("No email found for customer");
          break;
        }

        // Find user by email
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .limit(1);

        if (!profiles || profiles.length === 0) {
          logStep("No profile found for email", { email });
          break;
        }

        const userId = profiles[0].id;
        logStep("Found user", { userId, email });

        // Add credits to user
        const { data: creditResult, error: creditError } = await supabaseClient
          .rpc('add_credits', {
            p_user_id: userId,
            p_amount: planInfo.credits,
            p_type: 'subscription_credit',
            p_description: `Créditos do plano ${planInfo.name}`,
            p_reference_id: subscriptionId,
          });

        if (creditError) {
          logStep("Error adding credits", { error: creditError.message });
        } else {
          logStep("Credits added successfully", { credits: planInfo.credits, plan: planInfo.name });
        }

        // Get plan ID
        const { data: plans } = await supabaseClient
          .from('plans')
          .select('id')
          .eq('name', planInfo.name)
          .limit(1);

        const planId = plans?.[0]?.id;

        // Update or create subscription record
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          });

        if (subError) {
          logStep("Error updating subscription", { error: subError.message });
        } else {
          logStep("Subscription record updated");
        }
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          logStep("Error updating subscription status", { error: error.message });
        } else {
          logStep("Subscription marked as canceled", { subscriptionId: subscription.id });
        }
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
