'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Purchase {
  id: string;
  tokens_paid: number;
  status: string;
  created_at: string;
  videos: {
    id: string;
    title: string;
    description: string;
    content_url: string;
    thumbnail_url: string;
    content_type: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

export function MyPurchasesPage() {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadPurchases();
    }
  }, [profile]);

  const loadPurchases = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          videos:video_id (
            id,
            title,
            description,
            content_url,
            thumbnail_url,
            content_type
          ),
          profiles:creator_id (
            full_name,
            email
          )
        `)
        .eq('company_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (contentUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = contentUrl;
    link.download = title;
    link.target = '_blank';
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Purchases</h2>
          <p className="text-gray-600 mt-1">View and download your purchased content</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Purchases</h2>
        <p className="text-gray-600 mt-1">View and download your purchased content</p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No purchases yet
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Browse the marketplace to find content from creators
            </p>
            <Button asChild>
              <a href="/marketplace">Browse Marketplace</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {purchase.videos.thumbnail_url ? (
                    <img
                      src={purchase.videos.thumbnail_url}
                      alt={purchase.videos.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {purchase.videos.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          by {purchase.profiles.full_name || purchase.profiles.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          purchase.status === 'completed'
                            ? 'default'
                            : purchase.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </div>

                    {purchase.videos.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {purchase.videos.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {format(new Date(purchase.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-yellow-600">
                          {purchase.tokens_paid} Zaryo
                        </span>
                      </div>
                    </div>

                    {purchase.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            purchase.videos.content_url,
                            purchase.videos.title
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Content
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
