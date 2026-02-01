'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
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
    image_url: string;
    category: string;
  };
  admin: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function UserProductPurchases() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<ProductPurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<ProductPurchase[]>([]);
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
          purchase.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          purchase.admin.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPurchases(filtered);
    }
  }, [searchQuery, purchases]);

  const loadPurchases = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`/api/products/purchase?buyer_id=${profile.id}`);
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading your product purchases...</div>;
  }

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.tokens_paid, 0);
  const totalItems = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Product Purchases</h2>
          <p className="text-gray-600 mt-1">Your purchased products and order history</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{totalSpent}</div>
              <div className="text-sm text-gray-500">Total Spent (Zaryo)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-500">Items Purchased</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Your Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product name, category, or seller..."
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
          <CardDescription>All products you've purchased using Zaryo tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No purchases found' : 'No product purchases yet'}
              </h3>
              <p className="text-gray-500 text-center">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Visit the Products marketplace to start shopping'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Tokens Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {purchase.product.image_url && (
                            <img 
                              src={purchase.product.image_url} 
                              alt={purchase.product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{purchase.product.title}</div>
                            {purchase.product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {purchase.product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.admin.full_name}</div>
                          <div className="text-xs text-gray-500">{purchase.admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.product.category}</Badge>
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