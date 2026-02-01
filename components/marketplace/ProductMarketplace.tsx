'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Package, Loader2 } from 'lucide-react';
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
  admin: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function ProductMarketplace() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

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
      const response = await fetch(`/api/products?category=all`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load products');
      }
      
      console.log('Products loaded:', data.products); // Debug log
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error); // Debug log
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!profile) {
      toast({
        title: 'Error',
        description: 'Please log in to make a purchase',
        variant: 'destructive',
      });
      return;
    }

    if (profile.token_balance < product.price_tokens) {
      toast({
        title: 'Insufficient Tokens',
        description: `You need ${product.price_tokens} Zaryo tokens but only have ${profile.token_balance}`,
        variant: 'destructive',
      });
      return;
    }

    if (product.stock_quantity === 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(product.id);
    try {
      const response = await fetch('/api/products/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          buyer_id: profile.id,
          quantity: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase product');
      }

      // Show detailed success message
      toast({
        title: '🎉 Purchase Successful!',
        description: `You successfully purchased "${product.title}" for ${data.tokens_paid} Zaryo tokens. Your new balance will be updated shortly.`,
        duration: 5000, // Show for 5 seconds
      });

      // Refresh the page to update token balance and product stock
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Wait 2 seconds before refresh to let user see the message

    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Something went wrong during the purchase. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getStockDisplay = (stock: number) => {
    if (stock === -1) return 'In Stock';
    if (stock === 0) return 'Out of Stock';
    return `${stock} left`;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock > 0 && stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Discover and purchase amazing products using your Zaryo tokens
          </p>
        </div>
        {profile && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Your Balance</div>
            <div className="text-lg font-semibold text-green-600">
              {profile.token_balance || 0} Zaryo
            </div>
          </div>
        )}
      </div>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
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

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' ? 'No products found' : 'No products available'}
          </h3>
          <p className="text-gray-500 text-center">
            {searchQuery || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back later for new products'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <CardDescription className="mt-1">
                      By {product.admin.full_name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-green-600">
                    {product.price_tokens} Zaryo
                  </div>
                  <div className={`text-sm ${getStockColor(product.stock_quantity)}`}>
                    {getStockDisplay(product.stock_quantity)}
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(product)}
                  disabled={
                    !profile || 
                    purchasing === product.id || 
                    product.stock_quantity === 0 ||
                    (profile?.token_balance || 0) < product.price_tokens
                  }
                >
                  {purchasing === product.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock_quantity === 0 
                        ? 'Out of Stock' 
                        : !profile 
                        ? 'Login to Purchase'
                        : (profile.token_balance || 0) < product.price_tokens
                        ? 'Insufficient Tokens'
                        : `Purchase - ${product.price_tokens} Zaryo`}
                    </>
                  )}
                </Button>
                {purchasing === product.id && (
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    ⚠️ Please wait, processing your purchase...
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}