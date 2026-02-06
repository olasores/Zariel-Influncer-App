'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

interface InnovatorStats {
  tokenBalance: number;
  totalPurchases: number;
  totalEarned: number;
  totalSpent: number;
}

export function InnovatorOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<InnovatorStats>({
    tokenBalance: 0,
    totalPurchases: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      const { data: wallet } = await supabase
        .from('token_wallets')
        .select('balance, total_earned, total_spent')
        .eq('user_id', profile.id)
        .maybeSingle();

      const { count: purchaseCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.id);

      setStats({
        tokenBalance: wallet?.balance || 0,
        totalPurchases: purchaseCount || 0,
        totalEarned: wallet?.total_earned || 0,
        totalSpent: wallet?.total_spent || 0,
      });
    } catch (error) {
      console.error('Error loading company stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('id, amount, transaction_type, description, status, created_at')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error loading innovator recent transactions:', error);
    }
  };

  const statCards = [
    {
      title: 'Zaryo Balance',
      value: stats.tokenBalance.toLocaleString(),
      icon: Coins,
      description: 'Available tokens',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: ShoppingBag,
      description: 'Items purchased',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Earned',
      value: stats.totalEarned.toLocaleString(),
      icon: TrendingUp,
      description: 'Zaryo earned',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Spent',
      value: stats.totalSpent.toLocaleString(),
      icon: TrendingDown,
      description: 'Zaryo spent',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Innovator Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile?.full_name || profile?.email} · <span className="font-semibold text-purple-600">Tier 2 - Innovator</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="glass-card hover-card border-primary/20 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} bg-opacity-20`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card hover-card border-primary/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-primary">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/marketplace"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">Browse Marketplace</div>
              <div className="text-sm text-muted-foreground">
                Find content from creators
              </div>
            </a>
            <a
              href="/token-management"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">Purchase Zaryo</div>
              <div className="text-sm text-muted-foreground">
                Buy tokens to purchase content
              </div>
            </a>
            <a
              href="/my-purchases"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">My Purchases</div>
              <div className="text-sm text-muted-foreground">
                View purchased content
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="glass-card hover-card border-primary/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-primary">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent activity yet. Purchases and token movements will appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium text-primary">
                        {tx.description || tx.transaction_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        tx.amount >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {tx.amount >= 0 ? '+' : ''}
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
