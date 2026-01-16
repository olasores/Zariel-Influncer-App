import { supabase } from './supabase';

export interface CheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams) {
  const { priceId, mode, successUrl, cancelUrl } = params;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const success = successUrl || `${currentUrl}/?success=true`;
  const cancel = cancelUrl || `${currentUrl}/?canceled=true`;

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: success,
        cancel_url: cancel,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data;
}

export function redirectToCheckout(sessionUrl: string) {
  if (typeof window !== 'undefined') {
    window.location.href = sessionUrl;
  }
}
