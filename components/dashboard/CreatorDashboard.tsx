'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content, Subscription, TokenWallet } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ContentUploadDialog } from '@/components/dashboard/ContentUploadDialog';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Upload, FileText, TrendingUp, AlertCircle } from 'lucide-react';

export function CreatorDashboard() {
  const { profile } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    setLoading(true);

    const [contentRes, subRes, walletRes] = await Promise.all([
      supabase.from('videos').select('*').eq('creator_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('user_id', profile.id).eq('status', 'active').maybeSingle(),
      supabase.from('token_wallets').select('*').eq('user_id', profile.id).maybeSingle(),
    ]);

    if (contentRes.data) setContent(contentRes.data as Content[]);
    if (subRes.data) setSubscription(subRes.data as Subscription);
    if (walletRes.data) setWallet(walletRes.data as TokenWallet);

    setLoading(false);
  };

  const canUploadContent = () => {
    return true;
  };

  const handleContentUploaded = () => {
    fetchData();
    setUploadDialogOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your content portfolio</p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          disabled={!canUploadContent()}
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscription ? `${subscription.videos_uploaded_this_period}/10 this period` : 'No active subscription'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.balance.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {wallet?.total_earned.toLocaleString() || 0} earned total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Content</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Available for purchase</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {content.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No content uploaded yet</p>
                <Button onClick={() => setUploadDialogOpen(true)} disabled={!canUploadContent()}>
                  Upload Your First Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <ContentCard key={item.id} content={item} onUpdate={fetchData} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionCard subscription={subscription} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & Zaryo</CardTitle>
              <CardDescription>Track your Zaryo earnings and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Current Balance</span>
                  <span className="text-2xl font-bold">{wallet?.balance.toLocaleString() || 0} Zaryo</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total Earned</span>
                  <span className="text-lg font-semibold text-green-600">
                    +{wallet?.total_earned.toLocaleString() || 0} Zaryo
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total Spent</span>
                  <span className="text-lg font-semibold text-red-600">
                    -{wallet?.total_spent.toLocaleString() || 0} Zaryo
                  </span>
                </div>
                <Button className="w-full" disabled={!wallet || wallet.balance === 0}>
                  Redeem Zaryo for USD
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ContentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleContentUploaded}
        subscription={subscription}
      />
    </div>
  );
}
