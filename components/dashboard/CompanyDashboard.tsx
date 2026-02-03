'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content, Purchase, TokenWallet, Subscription } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { PurchaseDialog } from '@/components/dashboard/PurchaseDialog';
import { TokenIssuanceDialog } from '@/components/dashboard/TokenIssuanceDialog';
import { CompanyContentUploadDialog } from '@/components/dashboard/CompanyContentUploadDialog';
import { Coins, ShoppingCart, TrendingUp, Search, Upload, FileText, AlertCircle } from 'lucide-react';

export function CompanyDashboard() {
  const { profile } = useAuth();
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [myContent, setMyContent] = useState<Content[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    } else {
      setFilteredContent(allContent);
    }
  }, [searchQuery, allContent]);

  const fetchData = async () => {
    if (!profile) return;

    setLoading(true);

    const [contentRes, myContentRes, purchasesRes, walletRes, subscriptionRes] = await Promise.all([
      supabase.from('videos').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('videos').select('*').eq('creator_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('purchases').select('*').eq('company_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('token_wallets').select('*').eq('user_id', profile.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', profile.id).maybeSingle(),
    ]);

    if (contentRes.data) {
      setAllContent(contentRes.data as Content[]);
      setFilteredContent(contentRes.data as Content[]);
    }
    if (myContentRes.data) setMyContent(myContentRes.data as Content[]);
    if (purchasesRes.data) setPurchases(purchasesRes.data as Purchase[]);
    if (walletRes.data) setWallet(walletRes.data as TokenWallet);
    if (subscriptionRes.data) {
      setSubscription(subscriptionRes.data as Subscription);
    } else {
      setSubscription(null);
    }

    setLoading(false);
  };

  const handlePurchaseClick = (content: Content) => {
    setSelectedContent(content);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSuccess = () => {
    fetchData();
    setPurchaseDialogOpen(false);
    setSelectedContent(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const isAdminUser = profile ? isAdmin(profile) : false;
  const subscriptionAllowsUploads =
    !!subscription && new Date(subscription.current_period_end).getTime() > Date.now();
  const uploadLocked = !isAdminUser && !subscriptionAllowsUploads;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Browse, purchase, and sell content concepts</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`relative ${uploadLocked ? 'pointer-events-none blur-[1px] opacity-60' : ''}`}>
            <Button onClick={() => setUploadDialogOpen(true)} size="lg" disabled={uploadLocked}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </div>
          {uploadLocked && (
            <p className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Activate a membership to unlock company uploads.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allContent.length}</div>
            <p className="text-xs text-muted-foreground">Available to purchase</p>
          </CardContent>
        </Card>

        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myContent.length}</div>
            <p className="text-xs text-muted-foreground">Content for sale</p>
          </CardContent>
        </Card>

        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.balance.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Available for purchases</p>
          </CardContent>
        </Card>

        <Card className="hover-card glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">Concepts acquired</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="mycontent">My Content</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="tokens">Token Management</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredContent.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No content matches your search' : 'No content available yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  onUpdate={fetchData}
                  showPurchase
                  onPurchase={handlePurchaseClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mycontent" className="space-y-4">
          {myContent.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No content uploaded yet</p>
                <div className={`relative ${uploadLocked ? 'pointer-events-none blur-[1px] opacity-60' : ''}`}>
                  <Button onClick={() => setUploadDialogOpen(true)} disabled={uploadLocked}>
                    Upload Your First Content
                  </Button>
                </div>
                {uploadLocked && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    Activate a membership to start uploading company content.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myContent.map((item) => (
                <ContentCard key={item.id} content={item} onUpdate={fetchData} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Content concepts you've acquired</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchases yet. Browse the marketplace to find content concepts.
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white/5"
                    >
                      <div>
                        <p className="font-medium">Purchase #{purchase.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center text-yellow-600">
                        <Coins className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{purchase.tokens_paid} Zaryo</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Zaryo Management</CardTitle>
              <CardDescription>Purchase Zaryo tokens and manage your balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Current Balance</span>
                  <span className="text-2xl font-bold">{wallet?.balance.toLocaleString() || 0} Zaryo</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Total Spent</span>
                  <span className="text-lg font-semibold text-red-600">
                    -{wallet?.total_spent.toLocaleString() || 0} Zaryo
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setTokenDialogOpen(true)}>
                  Buy Zaryo
                </Button>
                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    Zaryo is the internal currency of the ZARIEL ecosystem. Purchase Zaryo at $1 per 10 Zaryo to buy content from creators and companies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedContent && (
        <PurchaseDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          content={selectedContent}
          wallet={wallet}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <TokenIssuanceDialog
        open={tokenDialogOpen}
        onOpenChange={setTokenDialogOpen}
        onSuccess={fetchData}
      />

      <CompanyContentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={fetchData}
        subscription={subscription}
      />
    </div>
  );
}
