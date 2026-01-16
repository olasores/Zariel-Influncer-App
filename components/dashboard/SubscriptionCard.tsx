'use client';

import { Subscription } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Calendar, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionCardProps {
  subscription: Subscription | null;
  onUpdate: () => void;
}

export function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const product = STRIPE_PRODUCTS.find(p => p.mode === 'subscription');
      if (!product) {
        throw new Error('Subscription product not found');
      }

      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: 'subscription',
      });

      redirectToCheckout(url);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Required</CardTitle>
          <CardDescription>Choose a plan to start uploading content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly Plan
                  <Badge>Popular</Badge>
                </CardTitle>
                <div className="text-3xl font-bold">$9.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Upload up to 10 content items/month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Videos, images, audio & more
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Earn tokens from sales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Access to ecosystem marketplace
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Monthly'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Yearly Plan
                  <Badge className="bg-blue-600">Save 17%</Badge>
                </CardTitle>
                <div className="text-3xl font-bold">$99.99</div>
                <CardDescription>per year ($8.33/month)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Upload up to 10 content items/month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Videos, images, audio & more
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Earn Zaryo from sales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Access to ecosystem marketplace
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Priority support
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => handleSubscribe('yearly')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe Yearly'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Secure payment processing powered by Stripe. You will be redirected to complete your subscription.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Active Subscription
          <Badge className="bg-green-600">
            {subscription.status === 'active' ? 'Active' : subscription.status}
          </Badge>
        </CardTitle>
        <CardDescription>Your current subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Plan Type</p>
              <p className="text-lg font-semibold capitalize">{subscription.plan_type}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Period End</p>
              <p className="text-lg font-semibold">
                {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Content This Period</p>
              <p className="text-lg font-semibold">
                {subscription.videos_uploaded_this_period}/10
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" disabled>
            Update Payment Method
          </Button>
          <Button variant="destructive" className="w-full" disabled>
            Cancel Subscription
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Your subscription automatically renews on{' '}
            {format(new Date(subscription.current_period_end), 'MMMM dd, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
