'use client';

import { Subscription } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Calendar, CreditCard, AlertCircle, Loader2, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { useToast } from '@/hooks/use-toast';

interface CompanySubscriptionCardProps {
  subscription: Subscription | null;
  onUpdate: () => void;
}

export function CompanySubscriptionCard({ subscription, onUpdate }: CompanySubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (planType: 'starter' | 'professional' | 'enterprise') => {
    setLoading(true);
    try {
      toast({
        title: 'Coming Soon',
        description: 'Company subscriptions will be available soon. For now, you can purchase Zaryo tokens directly.',
      });
      setLoading(false);
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
          <CardTitle>Company Subscription Plans</CardTitle>
          <CardDescription>Unlock premium features and maximize your content acquisition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Starter
                </CardTitle>
                <div className="text-3xl font-bold">$49</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    500 bonus Zaryo monthly
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    5% discount on all purchases
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Access to all creators
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Basic analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Email support
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('starter')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe to Starter'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600">
                  <Star className="mr-1 h-3 w-3" />
                  Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Professional
                </CardTitle>
                <div className="text-3xl font-bold">$149</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    2,000 bonus Zaryo monthly
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    15% discount on all purchases
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Priority access to new content
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Advanced analytics & insights
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Direct creator messaging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Priority support (24h response)
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('professional')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe to Professional'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Enterprise
                  <Badge className="bg-purple-600">
                    <Zap className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
                </CardTitle>
                <div className="text-3xl font-bold">$499</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    10,000 bonus Zaryo monthly
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    25% discount on all purchases
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Exclusive early access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Custom analytics & reporting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    White-label options
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    24/7 priority support
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('enterprise')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe to Enterprise'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All plans include access to the full marketplace, secure payments via Stripe, and the ability to upload your own content. Zaryo bonus tokens are added to your account each month.
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
        <CardDescription>Your current company subscription</CardDescription>
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
              <p className="text-sm font-medium">Status</p>
              <p className="text-lg font-semibold capitalize">
                {subscription.status}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" disabled>
            Upgrade Plan
          </Button>
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
