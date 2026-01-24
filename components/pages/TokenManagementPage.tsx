'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, TokenWallet } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { AdminTokenManagement } from '@/components/admin/AdminTokenManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';
import { useToast } from '@/hooks/use-toast';
import { RedeemTokensDialog } from '@/components/dashboard/RedeemTokensDialog';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  status: string;
  created_at: string;
}

export function TokenManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Route admin users to AdminTokenManagement
  if (profile && isAdmin(profile)) {
    return <AdminTokenManagement />;
  }

  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptionRequests, setRedemptionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadWalletData();
      loadTransactions();
      loadRedemptionRequests();
    }
  }, [profile]);

  const loadWalletData = async () => {
    if (!profile) return;

    try {
      console.log('Loading wallet for user:', profile.id);
      const { data, error } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Wallet load error:', error);
        throw error;
      }
      
      console.log('Wallet data loaded:', data);
      
      if (data) {
        setWallet(data);
      } else {
        console.log('No wallet found, creating new one');
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('token_wallets')
          .insert([{ user_id: profile.id, balance: 0 }])
          .select()
          .single();

        if (createError) {
          console.error('Wallet creation error:', createError);
          throw createError;
        }
        console.log('New wallet created:', newWallet);
        setWallet(newWallet);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadRedemptionRequests = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('redemption_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedemptionRequests(data || []);
    } catch (error) {
      console.error('Error loading redemption requests:', error);
    }
  };

  const handlePurchaseZaryo = async (productId: string) => {
    setPurchaseLoading(productId);

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
      toast({
        title: 'Error',
        description: err.message || 'Failed to start checkout',
        variant: 'destructive',
      });
      setPurchaseLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Token Management</h2>
        <p className="text-gray-600 mt-1">
          Manage your Zaryo tokens and view transaction history
        </p>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-50">
              <Coins className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {wallet?.balance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earned
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {wallet?.total_earned?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {wallet?.total_spent?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Tokens Section */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Redeem Tokens</CardTitle>
            <CardDescription>
              Convert your Zaryo tokens to cash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  You can redeem your earned tokens for cash payment. An admin will review your
                  request and process the payment through your preferred method.
                </p>
                <p className="text-xs text-gray-500">
                  Current balance: <span className="font-semibold text-yellow-600">{wallet.balance.toLocaleString()} Zaryo</span>
                </p>
              </div>
              <div className="ml-4">
                <RedeemTokensDialog
                  walletBalance={wallet.balance}
                  onSuccess={() => {
                    loadWalletData();
                    loadTransactions();
                    loadRedemptionRequests();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Zaryo Tokens</CardTitle>
          <CardDescription>
            Buy tokens to purchase content from creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STRIPE_PRODUCTS.filter(p => p.mode === 'payment').map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    ${product.price}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handlePurchaseZaryo(product.id)}
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === product.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redemption Requests History */}
      {redemptionRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Redemption Requests</CardTitle>
            <CardDescription>Your token redemption request history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {redemptionRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-50">
                      <Coins className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.token_count.toLocaleString()} Zaryo Redemption
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')} • {request.payment_method}
                      </div>
                      {request.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          Note: {request.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        request.status === 'completed'
                          ? 'default'
                          : request.status === 'pending'
                          ? 'secondary'
                          : request.status === 'approved'
                          ? 'default'
                          : 'destructive'
                      }
                      className={
                        request.status === 'approved' ? 'bg-blue-600' : ''
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest token activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.amount > 0
                          ? 'bg-green-50'
                          : 'bg-red-50'
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description || transaction.transaction_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount.toLocaleString()}
                    </div>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
