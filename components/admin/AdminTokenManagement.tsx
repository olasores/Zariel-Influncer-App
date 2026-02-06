'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, TokenWallet } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenTransaction {
  id: string;
  created_at: string;
  amount: number;
  transaction_type: string;
  description: string | null;
}

export function AdminTokenManagement() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadWalletData();
    }
  }, [profile]);

  const loadWalletData = async () => {
    if (!profile) return;

    try {
      // Load balance from profiles.token_balance instead of token_wallets
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', profile.id)
        .single();

      if (profileError) throw profileError;

      // Create a wallet object for compatibility
      const walletData: TokenWallet = {
        id: profile.id,
        user_id: profile.id,
        balance: profileData?.token_balance || 0,
        total_earned: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setWallet(walletData);

      // Load transactions
      const { data: transData, error: transError } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transError) throw transError;
      setTransactions(transData || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading token data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Token Management</h2>
          <p className="text-gray-600 mt-1">
            Manage Zaryo tokens and view transaction history
          </p>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Account:</strong> You can purchase Zaryo tokens at standard rates. Tokens can be used to purchase content or test platform functionality.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.balance?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Zaryo tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.total_earned?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Zaryo tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.total_spent?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Zaryo tokens</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Zaryo Tokens</CardTitle>
          <CardDescription>Rate: $1 = 100 Zaryo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">100</div>
                  <div className="text-sm text-gray-600">Zaryo</div>
                  <div className="text-lg font-semibold">$1.00</div>
                  <Button className="w-full" variant="outline" size="sm">
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">500</div>
                  <div className="text-sm text-gray-600">Zaryo</div>
                  <div className="text-lg font-semibold">$5.00</div>
                  <Button className="w-full" variant="outline" size="sm">
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">1,000</div>
                  <div className="text-sm text-gray-600">Zaryo</div>
                  <div className="text-lg font-semibold">$10.00</div>
                  <Button className="w-full" variant="outline" size="sm">
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">5,000</div>
                  <div className="text-sm text-gray-600">Zaryo</div>
                  <div className="text-lg font-semibold">$50.00</div>
                  <Button className="w-full" variant="outline" size="sm">
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent token activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Info className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Txn ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.transaction_type === 'purchase' || transaction.transaction_type === 'credit'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{transaction.description || '-'}</TableCell>
                      <TableCell className="text-xs font-mono text-gray-500 max-w-[160px] truncate">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span
                          className={
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
