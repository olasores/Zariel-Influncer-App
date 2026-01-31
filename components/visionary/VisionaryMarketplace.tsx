'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content as BaseContent, TokenWallet } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { PurchaseDialog } from '@/components/dashboard/PurchaseDialog';
import { Search, FileVideo } from 'lucide-react';

interface ContentWithCreator extends BaseContent {
  profiles: {
    full_name: string;
    email: string;
  };
}

export function CompanyMarketplace() {
  const { profile } = useAuth();
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
    loadContent();
    loadWallet();
    setPurchaseDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Company Marketplace</h2>
          <p className="text-gray-600 mt-1">
            Discover and purchase content from creators
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Content</CardTitle>
          <CardDescription>Find videos, images, audio, documents, and more to purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
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
            <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No content found' : 'No content available'}
            </h3>
            <p className="text-gray-500 text-center">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back later for new content from creators'}
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
              showPurchase={true}
              showBidding={true}
              userBalance={wallet?.balance || 0}
              onPurchase={() => handlePurchase(item)}
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
