import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };

  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400, headers: corsHeaders });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400, headers: corsHeaders });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;
    const subscriptionPayload =
      typeof (stripeData as { object?: string }).object === 'string' &&
      (stripeData as { object?: string }).object === 'subscription'
        ? (stripeData as Stripe.Subscription)
        : null;

    const subscriptionIdFromEvent =
      typeof (stripeData as { subscription?: string }).subscription === 'string'
        ? (stripeData as { subscription: string }).subscription
        : null;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId, subscriptionPayload, subscriptionIdFromEvent);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          metadata,
        } = stripeData as Stripe.Checkout.Session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }

        // Get the user_id from the customer_id
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (customerError || !customerData) {
          console.error('Error fetching customer user_id:', customerError);
          return;
        }

        // Calculate Zaryo amount based on price
        // Map: $1 = 100 Zaryo, $5 = 500 Zaryo, $10 = 1000 Zaryo, $50 = 5000 Zaryo
        const amountInDollars = (amount_total || 0) / 100; // Convert cents to dollars
        let zaryoAmount = 0;

        // Determine Zaryo amount based on purchase amount
        if (amountInDollars === 1) {
          zaryoAmount = 100;
        } else if (amountInDollars === 5) {
          zaryoAmount = 500;
        } else if (amountInDollars === 10) {
          zaryoAmount = 1000;
        } else if (amountInDollars === 50) {
          zaryoAmount = 5000;
        } else {
          // Fallback: 1 dollar = 100 Zaryo
          zaryoAmount = Math.floor(amountInDollars * 100);
        }

        console.info(`Processing token purchase: $${amountInDollars} = ${zaryoAmount} Zaryo`);

        if (zaryoAmount > 0) {
          // Get the user's wallet
          const { data: wallet, error: walletError } = await supabase
            .from('token_wallets')
            .select('*')
            .eq('user_id', customerData.user_id)
            .maybeSingle();

          if (walletError || !wallet) {
            console.error('Error fetching wallet:', walletError);
            return;
          }

          // Update wallet balance
          const { error: updateError } = await supabase
            .from('token_wallets')
            .update({
              balance: wallet.balance + zaryoAmount,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', customerData.user_id);

          if (updateError) {
            console.error('Error updating wallet:', updateError);
            return;
          }

          // Record the transaction
          const { error: transactionError } = await supabase.from('token_transactions').insert({
            to_user_id: customerData.user_id,
            amount: zaryoAmount,
            transaction_type: 'issuance',
            description: `Purchased ${zaryoAmount} Zaryo via Stripe`,
            status: 'completed',
          });

          if (transactionError) {
            console.error('Error recording transaction:', transactionError);
            return;
          }

          console.info(`Successfully credited ${zaryoAmount} Zaryo to user ${customerData.user_id}`);
        }

        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(
  customerId: string,
  subscriptionPayload?: Stripe.Subscription | null,
  subscriptionIdFromEvent?: string | null,
) {
  try {
    let subscription: Stripe.Subscription | null = subscriptionPayload ?? null;

    if (subscription && subscription.default_payment_method && typeof subscription.default_payment_method === 'string') {
      subscription = await stripe.subscriptions.retrieve(subscription.id, {
        expand: ['default_payment_method'],
      });
    }

    if (!subscription && subscriptionIdFromEvent) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionIdFromEvent, {
          expand: ['default_payment_method'],
        });
      } catch (error) {
        console.error(`Failed to retrieve subscription ${subscriptionIdFromEvent}:`, error);
      }
    }

    if (!subscription) {
      // fetch latest subscription data from Stripe as fallback
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      if (subscriptions.data.length === 0) {
        console.info(`No active subscriptions found for customer: ${customerId}`);
        const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
          {
            customer_id: customerId,
            status: 'not_started',
          },
          {
            onConflict: 'customer_id',
          },
        );

        if (noSubError) {
          console.error('Error updating subscription status:', noSubError);
          throw new Error('Failed to update subscription status in database');
        }

        await upsertAppSubscription(customerId, null);
        return;
      }

      subscription = subscriptions.data[0];
    }

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);

    await upsertAppSubscription(customerId, subscription);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}

async function upsertAppSubscription(customerId: string, stripeSubscription: Stripe.Subscription | null) {
  try {
    const { data: customerRecord, error: customerLookupError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (customerLookupError) {
      console.error('Failed to look up customer mapping:', customerLookupError);
      return;
    }

    const userId = customerRecord?.user_id;

    if (!userId) {
      console.warn(`No user found for customer ${customerId}`);
      return;
    }

      const { data: existingSubscription, error: existingSubscriptionError } = await supabase
        .from('subscriptions')
        .select('id, videos_uploaded_this_period, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (existingSubscriptionError) {
      console.error('Failed to fetch existing subscription record:', existingSubscriptionError);
      return;
    }

    if (!stripeSubscription) {
      if (existingSubscription) {
        const { error: expireError } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSubscription.id);

        if (expireError) {
          console.error('Failed to mark subscription as expired:', expireError);
        }
      }

      return;
    }

    const recurringInterval = stripeSubscription.items.data[0]?.price?.recurring?.interval;
    const planType: 'monthly' | 'yearly' = recurringInterval === 'year' ? 'yearly' : 'monthly';
    const status = mapStripeStatusToApp(stripeSubscription.status);
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();

    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Failed to update existing subscription record:', updateError);
      }
    } else {
      const { error: insertError } = await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planType,
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end ?? false,
        videos_uploaded_this_period: 0,
      });

      if (insertError) {
        console.error('Failed to create subscription record:', insertError);
      }
    }
  } catch (error) {
    console.error('Error syncing application subscription state:', error);
  }
}

function mapStripeStatusToApp(status: Stripe.Subscription.Status): 'active' | 'cancelled' | 'expired' {
  if (status === 'active' || status === 'trialing' || status === 'past_due') {
    return 'active';
  }
  if (status === 'canceled') {
    return 'cancelled';
  }
  return 'expired';
}