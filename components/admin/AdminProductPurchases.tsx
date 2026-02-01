'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductPurchase {
  id: string;
  tokens_paid: number;
  quantity: number;
  status: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  admin: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function AdminProductPurchases() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<ProductPurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<ProductPurchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadPurchases();
    }
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPurchases(purchases);
    } else {
      const filtered = purchases.filter(
        (purchase) =>
          purchase.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.buyer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.buyer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPurchases(filtered);
    }
  }, [searchQuery, purchases]);

  const loadPurchases = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/products/purchase?admin_id=${profile.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load purchases');
      }
      
      setPurchases(data.purchases || []);
      setFilteredPurchases(data.purchases || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (role: string) => {
    const variants = {
      creator: 'default',
      innovator: 'secondary', 
      visionary: 'destructive',
      admin: 'outline',
    } as const;

    const labels = {
      creator: 'Creator',
      innovator: 'Innovator',
      visionary: 'Visionary', 
      admin: 'Admin',
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  if (!profile || profile.role !== 'admin') {
    return <div>Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading purchases...</div>;
  }

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.tokens_paid, 0);
  const totalSales = purchases.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Sales</h2>
          <p className="text-gray-600 mt-1">Track product purchases and customer information</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{totalRevenue}</div>
              <div className="text-sm text-gray-500">Total Revenue (Zaryo)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
              <div className="text-sm text-gray-500">Total Sales</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product or buyer..."
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
          <CardTitle>Sales History ({filteredPurchases.length})</CardTitle>
          <CardDescription>All product purchases made by users</CardDescription>
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
                  : 'Product purchases will appear here once users start buying'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.product.title}</div>
                          <div className="text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {purchase.product.category}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.buyer.full_name}</div>
                          <div className="text-xs text-gray-500">{purchase.buyer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTierBadge(purchase.buyer.role)}
                      </TableCell>
                      <TableCell className="text-center">
                        {purchase.quantity}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {purchase.tokens_paid} Zaryo
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {purchase.status.toUpperCase()}
                        </Badge>
                      </TableCell>
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