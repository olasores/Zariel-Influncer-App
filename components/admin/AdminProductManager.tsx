'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminProductForm } from './AdminProductForm';
import { Edit, Trash2, Search, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_tokens: number;
  category: string;
  stock_quantity: number;
  status: string;
  created_at: string;
  admin: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function AdminProductManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadProducts();
    }
  }, [profile]);

  useEffect(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load products');
      }
      
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
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

  const handleDeleteProduct = async (productId: string) => {
    if (!profile || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products?id=${productId}&admin_id=${profile.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });

      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      out_of_stock: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStockDisplay = (stock: number) => {
    if (stock === -1) return 'Unlimited';
    if (stock === 0) return 'Out of Stock';
    return stock.toString();
  };

  if (!profile || profile.role !== 'admin') {
    return <div>Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage marketplace products</p>
        </div>
        <AdminProductForm onProductCreated={loadProducts} />
      </div>

      {products.length > 0 && (
        <Card className="hover-card glass-card border-none">
          <CardHeader>
            <CardTitle>Filter Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md bg-white/5 border-white/10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="hover-card glass-card border-none">
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>All marketplace products</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || categoryFilter !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by creating your first product'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-white/5 border-white/10">
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-white/5 border-white/10">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.title}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white/10">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.price_tokens} Zaryo
                      </TableCell>
                      <TableCell>{getStockDisplay(product.stock_quantity)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-red-400"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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