'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, FileVideo, TrendingUp, Users } from 'lucide-react';

interface CreatorStats {
  tokenBalance: number;
  totalContent: number;
  totalEarned: number;
  totalSpent: number;
}

export function CreatorOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<CreatorStats>({
    tokenBalance: 0,
    totalContent: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStats();
      
      // Subscribe to real-time updates
      const transactionSubscription = supabase
        .channel(`dashboard-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_transactions',
          },
          () => {
            loadStats();
          }
        )
        .subscribe();

      return () => {
        transactionSubscription.unsubscribe();
      };
    }
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      // Get token balance from profile
      const tokenBalance = profile.token_balance || 0;

      // Get content count
      const { count: contentCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id);

      // Get all transactions to calculate earned/spent
      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`);

      // Calculate total earned (money received from sales/bids, NOT purchases or issuance)
      const totalEarned = (transactions || [])
        .filter(t => 
          t.to_user_id === profile.id && 
          ['bid_accepted', 'bid_received'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate total spent (money sent for purchases/bids)
      const totalSpent = (transactions || [])
        .filter(t => 
          t.from_user_id === profile.id &&
          ['purchase', 'bid_payment', 'ecosystem_purchase'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        tokenBalance,
        totalContent: contentCount || 0,
        totalEarned,
        totalSpent,
      });
    } catch (error) {
      console.error('Error loading creator stats:', error);
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
      title: 'My Content',
      value: stats.totalContent,
      icon: FileVideo,
      description: 'Content items',
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
      icon: Users,
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
        <h2 className="text-3xl font-bold text-gray-900">Creator Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome back, {profile?.full_name || profile?.email} · <span className="font-semibold text-blue-600">Tier 1 - Creator</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="glass-card hover-card border-primary/20 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor} bg-opacity-20`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
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
              href="/my-content"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">Upload Content</div>
              <div className="text-sm text-muted-foreground">
                Share your videos, images, and more
              </div>
            </a>
            <a
              href="/marketplace"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">Browse Marketplace</div>
              <div className="text-sm text-muted-foreground">
                Discover content from other creators
              </div>
            </a>
            <a
              href="/token-management"
              className="block p-3 rounded-lg border border-primary/20 hover:border-accent/50 hover:bg-accent/10 transition-colors bg-white/5"
            >
              <div className="font-medium text-primary">Manage Tokens</div>
              <div className="text-sm text-muted-foreground">
                Purchase Zaryo and view transactions
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
            <div className="text-sm text-muted-foreground">
              View your recent transactions in Token Management
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
