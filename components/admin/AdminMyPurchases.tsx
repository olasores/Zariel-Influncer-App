'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag } from 'lucide-react';

interface Purchase {
  id: string;
  created_at: string;
  tokens_paid: number;
  content: {
    id: string;
    title: string;
    content_type: string;
    creator: {
      full_name: string;
      email: string;
    };
  };
}

export function AdminMyPurchases() {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadPurchases();
    }
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPurchases(purchases);
    } else {
      const filtered = purchases.filter(
        (purchase) =>
          purchase.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.content.creator.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPurchases(filtered);
    }
  }, [searchQuery, purchases]);

  const loadPurchases = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          created_at,
          tokens_paid,
          content:videos!video_id (
            id,
            title,
            content_type,
            creator:profiles!videos_creator_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq('company_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data as any || []);
      setFilteredPurchases(data as any || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading purchases...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Purchases</h2>
          <p className="text-gray-600 mt-1">
            View all content purchased with admin account
          </p>
        </div>
      </div>

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase History ({filteredPurchases.length})</CardTitle>
          <CardDescription>All content acquired through admin account</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No purchases found' : 'No purchases yet'}
              </h3>
              <p className="text-gray-500 text-center">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Browse the marketplace to purchase content'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tokens Spent</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.content.title}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.content.creator.full_name}</div>
                          <div className="text-xs text-gray-500">{purchase.content.creator.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.content.content_type || 'video'}</Badge>
                      </TableCell>
                      <TableCell>{purchase.tokens_paid} Zaryo</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString()}
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
