'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Coins, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';

interface TokenIssuanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TokenIssuanceDialog({ open, onOpenChange, onSuccess }: TokenIssuanceDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('1000');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [issueAmount, setIssueAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handlePurchaseZaryo = async (productId: string) => {
    setPurchaseLoading(productId);
    setError('');

    try {
      const product = STRIPE_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: 'payment',
      });

      redirectToCheckout(url);
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setPurchaseLoading(null);
    }
  };

  const handleAddTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const tokenAmount = parseInt(amount);
      if (tokenAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const { data: wallet } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      await supabase
        .from('token_wallets')
        .update({
          balance: wallet.balance + tokenAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.id);

      await supabase.from('token_transactions').insert({
        to_user_id: profile.id,
        amount: tokenAmount,
        transaction_type: 'issuance',
        description: 'Company token issuance',
        status: 'completed',
      });

      toast({
        title: 'Success',
        description: `${tokenAmount} Zaryo added to your balance`,
      });

      setAmount('1000');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueToCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const tokenAmount = parseInt(issueAmount);
      if (tokenAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', creatorEmail)
        .eq('role', 'creator')
        .maybeSingle();

      if (!creatorProfile) {
        throw new Error('Creator not found with that email');
      }

      const { data: companyWallet } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!companyWallet || companyWallet.balance < tokenAmount) {
        throw new Error('Insufficient token balance');
      }

      const { data: creatorWallet } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', creatorProfile.id)
        .maybeSingle();

      if (!creatorWallet) {
        throw new Error('Creator wallet not found');
      }

      await supabase
        .from('token_wallets')
        .update({
          balance: companyWallet.balance - tokenAmount,
          total_spent: companyWallet.total_spent + tokenAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.id);

      await supabase
        .from('token_wallets')
        .update({
          balance: creatorWallet.balance + tokenAmount,
          total_earned: creatorWallet.total_earned + tokenAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', creatorProfile.id);

      await supabase.from('token_transactions').insert({
        from_user_id: profile.id,
        to_user_id: creatorProfile.id,
        amount: tokenAmount,
        transaction_type: 'issuance',
        description: `Token issuance to creator: ${creatorProfile.full_name || creatorProfile.email}`,
        status: 'completed',
      });

      toast({
        title: 'Success',
        description: `${tokenAmount} Zaryo issued to ${creatorProfile.full_name || creatorProfile.email}`,
      });

      setCreatorEmail('');
      setIssueAmount('100');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to issue tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zaryo Management</DialogTitle>
          <DialogDescription>Purchase Zaryo or issue to creators</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="purchase" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="purchase">Purchase Zaryo</TabsTrigger>
            <TabsTrigger value="issue">Issue to Creator</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="purchase" className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Coins className="mr-2 h-5 w-5 text-yellow-600" />
                Buy Zaryo Tokens
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Purchase Zaryo at $1 per 10 Zaryo to buy content from creators and companies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100 Zaryo</div>
                  <div className="text-2xl font-semibold mb-3">$10</div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseZaryo('zaryo_100')}
                    disabled={purchaseLoading !== null}
                  >
                    {purchaseLoading === 'zaryo_100' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy with Stripe'
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500 Zaryo</div>
                  <div className="text-2xl font-semibold mb-3">$50</div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseZaryo('zaryo_500')}
                    disabled={purchaseLoading !== null}
                  >
                    {purchaseLoading === 'zaryo_500' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy with Stripe'
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition-colors relative">
                <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  POPULAR
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1,000 Zaryo</div>
                  <div className="text-2xl font-semibold mb-3">$100</div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseZaryo('zaryo_1000')}
                    disabled={purchaseLoading !== null}
                  >
                    {purchaseLoading === 'zaryo_1000' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy with Stripe'
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">5,000 Zaryo</div>
                  <div className="text-2xl font-semibold mb-3">$500</div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseZaryo('zaryo_5000')}
                    disabled={purchaseLoading !== null}
                  >
                    {purchaseLoading === 'zaryo_5000' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy with Stripe'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Secure payment processing powered by Stripe. You will be redirected to complete your purchase.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Purchase Zaryo securely through Stripe</li>
                <li>• Instant delivery to your wallet</li>
                <li>• Use Zaryo to buy content from creators and companies</li>
                <li>• Rate: $1 USD = 10 Zaryo tokens</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="issue">
            <form onSubmit={handleIssueToCreator} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creatorEmail">Creator Email</Label>
                <Input
                  id="creatorEmail"
                  type="email"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  placeholder="creator@example.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email address of the creator you want to issue Zaryo to
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueAmount">Zaryo Amount</Label>
                <Input
                  id="issueAmount"
                  type="number"
                  value={issueAmount}
                  onChange={(e) => setIssueAmount(e.target.value)}
                  min="1"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of Zaryo to transfer to the creator
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  This will transfer Zaryo from your company balance to the creator's wallet.
                  Make sure you have sufficient balance before proceeding.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Issue Zaryo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
