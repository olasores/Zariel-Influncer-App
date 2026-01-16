'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, ArrowUpDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';
import { useToast } from '@/hooks/use-toast';

interface TokenWallet {
  balance: number;
  total_earned: number;
  total_spent: number;
}

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
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadWalletData();
      loadTransactions();
    }
  }, [profile]);

  const loadWalletData = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('token_wallets')
        .select('balance, total_earned, total_spent')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error loading wallet:', error);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseZaryo = async (productId: string) => {
    setPurchaseLoading(productId);

    try {
      const product = STRIPE_PRODUCTS.find((p) => p.id === productId);
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

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'issuance' && amount > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (type === 'purchase' || type === 'ecosystem_purchase') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Token Management</h2>
          <p className="text-gray-600 mt-1">Manage your Zaryo tokens</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Token Management</h2>
        <p className="text-gray-600 mt-1">Manage your Zaryo tokens and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
            <Coins className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {wallet?.balance.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earned
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {wallet?.total_earned.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {wallet?.total_spent.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Zaryo spent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Zaryo</CardTitle>
          <CardDescription>
            Buy Zaryo tokens to purchase content (Rate: $1 = 10 Zaryo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">100 Zaryo</div>
                <div className="text-xl font-semibold mb-3">$10</div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handlePurchaseZaryo('zaryo_100')}
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === 'zaryo_100' ? 'Processing...' : 'Buy'}
                </Button>
              </div>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">500 Zaryo</div>
                <div className="text-xl font-semibold mb-3">$50</div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handlePurchaseZaryo('zaryo_500')}
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === 'zaryo_500' ? 'Processing...' : 'Buy'}
                </Button>
              </div>
            </div>

            <div className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition-colors relative">
              <div className="absolute -top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                POPULAR
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">1,000 Zaryo</div>
                <div className="text-xl font-semibold mb-3">$100</div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handlePurchaseZaryo('zaryo_1000')}
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === 'zaryo_1000' ? 'Processing...' : 'Buy'}
                </Button>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">5,000 Zaryo</div>
                <div className="text-xl font-semibold mb-3">$500</div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handlePurchaseZaryo('zaryo_5000')}
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === 'zaryo_5000' ? 'Processing...' : 'Buy'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent Zaryo transactions</CardDescription>
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full">
                      {getTransactionIcon(
                        transaction.transaction_type,
                        transaction.amount
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || transaction.transaction_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {transaction.status}
                    </Badge>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount.toLocaleString()}
                    </div>
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
