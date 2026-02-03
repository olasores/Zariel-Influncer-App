'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
  from_user_id: string | null;
  to_user_id: string | null;
}

export function TokenManagementPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  // Route admin users to AdminTokenManagement
  if (profile && isAdmin(profile)) {
    return <AdminTokenManagement />;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptionRequests, setRedemptionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (profile) {
      loadData();
      
      // Subscribe to transaction changes for real-time updates
      const transactionSubscription = supabase
        .channel(`transactions-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_transactions',
          },
          () => {
            console.log('Transaction changed, reloading data');
            loadData();
            refreshProfile();
          }
        )
        .subscribe();

      return () => {
        transactionSubscription.unsubscribe();
      };
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    await Promise.all([
      loadTransactions(),
      loadRedemptionRequests(),
    ]);
    setLoading(false);
  };

  const loadTransactions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const allTransactions = data || [];
      setTransactions(allTransactions);

      // Calculate total earned (money received from sales/bids, NOT purchases or issuance)
      // Only count: bid_accepted, bid_received, ecosystem_purchase (when you're the seller)
      const earned = allTransactions
        .filter(t => 
          t.to_user_id === profile.id && 
          ['bid_accepted', 'bid_received'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate total spent (money sent for purchases/bids)
      // Count: purchase, bid_payment, ecosystem_purchase (when you're the buyer)
      const spent = allTransactions
        .filter(t => 
          t.from_user_id === profile.id &&
          ['purchase', 'bid_payment', 'ecosystem_purchase'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      console.log('Total Earned (from sales):', earned);
      console.log('Total Spent (on purchases):', spent);
      
      setTotalEarned(earned);
      setTotalSpent(spent);
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

  const currentBalance = profile?.token_balance || 0;

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
        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
            <div className="p-2 rounded-lg bg-yellow-50 bg-opacity-20">
              <Coins className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zaryo available</p>
          </CardContent>
        </Card>

        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 bg-opacity-20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zaryo earned</p>
          </CardContent>
        </Card>

        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50 bg-opacity-20">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zaryo spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Tokens Section */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Redeem Tokens</CardTitle>
          <CardDescription>
            Convert your Zaryo tokens to cash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                You can redeem your earned tokens for cash payment. An admin will review your
                request and process the payment through your preferred method.
              </p>
              <p className="text-xs text-muted-foreground">
                Current balance: <span className="font-semibold text-yellow-600">{currentBalance.toLocaleString()} Zaryo</span>
              </p>
            </div>
            <div className="ml-4">
              <RedeemTokensDialog
                walletBalance={currentBalance}
                onSuccess={() => {
                  loadData();
                  refreshProfile();
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Tokens */}
      <Card className="glass-card border-none">
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
                className="hover-card glass-card border border-primary/20 rounded-lg p-4 space-y-3 cursor-pointer"
                onClick={() => handlePurchaseZaryo(product.id)}
              >
                <div>
                  <div className="text-xl font-bold">
                    {product.name}
                  </div>
                  <div className="text-2xl font-bold text-blue-500 mt-1">
                    ${product.price}
                  </div>
                </div>
                <Button
                  className="w-full"
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
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Redemption Requests</CardTitle>
            <CardDescription>Your token redemption request history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {redemptionRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-50 bg-opacity-20">
                      <Coins className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {request.token_count.toLocaleString()} Zaryo Redemption
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')} • {request.payment_method}
                      </div>
                      {request.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
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
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest token activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.amount > 0
                          ? 'bg-green-50/20'
                          : 'bg-red-50/20'
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {transaction.description || transaction.transaction_type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-500'
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
