'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileVideo, Coins, TrendingUp, DollarSign, ShoppingBag, LayoutDashboard, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminContentManager } from './AdminContentManager';
import { AdminUserManager } from './AdminUserManager';

interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalCompanies: number;
  totalContent: number;
  totalTransactions: number;
  totalTokensInCirculation: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCreators: 0,
    totalCompanies: 0,
    totalContent: 0,
    totalTransactions: 0,
    totalTokensInCirculation: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && isAdmin(profile)) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator');

      const { count: totalCompanies } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'company');

      // Get content count
      const { count: totalContent } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true });

      // Get transaction count
      const { count: totalTransactions } = await supabase
        .from('token_transactions')
        .select('*', { count: 'exact', head: true });

      // Get total tokens in circulation
      const { data: wallets } = await supabase
        .from('token_wallets')
        .select('balance');

      const totalTokens = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;

      // Get total revenue from orders
      const { data: orders } = await supabase
        .from('stripe_orders')
        .select('amount_total');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalCreators: totalCreators || 0,
        totalCompanies: totalCompanies || 0,
        totalContent: totalContent || 0,
        totalTransactions: totalTransactions || 0,
        totalTokensInCirculation: totalTokens,
        totalRevenue: totalRevenue / 100, // Convert from cents to dollars
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile || !isAdmin(profile)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
        <Badge variant="default" className="text-sm">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileVideo className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(7)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Creators
                  </CardTitle>
                  <Users className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalCreators.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Content creators</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Companies
                  </CardTitle>
                  <Users className="h-5 w-5 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalCompanies.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Company accounts</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Content
                  </CardTitle>
                  <FileVideo className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalContent.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded items</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transactions
                  </CardTitle>
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalTransactions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total transactions</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tokens in Circulation
                  </CardTitle>
                  <Coins className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalTokensInCirculation.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Zaryo tokens</p>
                </CardContent>
              </Card>

              <Card className="hover-card glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From token sales</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="content">
          <AdminContentManager />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
