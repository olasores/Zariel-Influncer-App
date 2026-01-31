'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content as BaseContent, TokenWallet } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { AdminMarketplaceBidding } from '@/components/admin/AdminMarketplaceBidding';
import { CreatorMarketplace } from '@/components/creator/CreatorMarketplace';
import { CompanyMarketplace } from '@/components/company/CompanyMarketplace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { PurchaseDialog } from '@/components/dashboard/PurchaseDialog';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentWithCreator extends BaseContent {
  profiles: {
    full_name: string;
    email: string;
  };
}

export function MarketplacePage() {
  const { profile } = useAuth();
  
  // Route admin users to AdminMarketplaceBidding
  if (profile && isAdmin(profile)) {
    return <AdminMarketplaceBidding />;
  }

  // Route creators to CreatorMarketplace
  if (profile?.role === 'creator') {
    return <CreatorMarketplace />;
  }

  // Route companies to CompanyMarketplace
  if (profile?.role === 'innovator' || profile?.role === 'visionary') {
    return <CompanyMarketplace />;
  }

  const [content, setContent] = useState<ContentWithCreator[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentWithCreator | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [wallet, setWallet] = useState<TokenWallet | null>(null);

  useEffect(() => {
    loadContent();
    if (profile) {
      loadWallet();
    }
  }, [profile]);

  const loadWallet = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      setWallet(data);
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    } else {
      setFilteredContent(content);
    }
  }, [searchQuery, content]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
      setFilteredContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (item: ContentWithCreator) => {
    setSelectedContent(item);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseSuccess = () => {
    setPurchaseDialogOpen(false);
    loadContent();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Marketplace</h2>
        <p className="text-gray-600 mt-1">
          Discover and purchase content from creators
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search content by title, description, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No content found' : 'No content available'}
            </h3>
            <p className="text-gray-500 text-center">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back later for new content'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onUpdate={loadContent}
              onPurchase={() => handlePurchase(item)}
              showPurchase={profile?.role === 'innovator' || profile?.role === 'visionary'}
            />
          ))}
        </div>
      )}

      {selectedContent && (
        <PurchaseDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          content={selectedContent}
          wallet={wallet}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
