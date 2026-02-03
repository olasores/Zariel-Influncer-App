'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

interface VisionaryStats {
  tokenBalance: number;
  totalPurchases: number;
  totalEarned: number;
  totalSpent: number;
}

export function VisionaryOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<VisionaryStats>({
    tokenBalance: 0,
    totalPurchases: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-3xl font-bold text-gray-900">Visionary Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile?.full_name || profile?.email} · <span className="font-semibold text-green-600">Tier 3 - Visionary</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="hover-card glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor} bg-opacity-20`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card hover-card border-none">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/marketplace"
              className="block p-3 rounded-lg border border-gray-200/20 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="font-medium">Browse Marketplace</div>
              <div className="text-sm text-muted-foreground">
                Find content from creators
              </div>
            </a>
            <a
              href="/token-management"
              className="block p-3 rounded-lg border border-gray-200/20 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="font-medium">Purchase Zaryo</div>
              <div className="text-sm text-muted-foreground">
                Buy tokens to purchase content
              </div>
            </a>
            <a
              href="/my-purchases"
              className="block p-3 rounded-lg border border-gray-200/20 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="font-medium">My Purchases</div>
              <div className="text-sm text-muted-foreground">
                View purchased content
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="glass-card hover-card border-none">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              View your recent transactions in Token Management
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
