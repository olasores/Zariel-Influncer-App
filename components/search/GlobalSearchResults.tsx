'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileVideo, Package, Briefcase, User, Search, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'content' | 'product' | 'service' | 'creator';
  title: string;
  description: string;
  image_url?: string;
  price?: number;
  category?: string;
  url: string;
}

export function GlobalSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    const term = `%${searchTerm}%`;
    const allResults: SearchResult[] = [];

    try {
      // 1. Search Content (Videos)
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, description, thumbnail_url, price_tokens, content_type')
        .or(`title.ilike.${term},description.ilike.${term}`)
        .eq('status', 'active')
        .limit(5);
        
      if (videos) {
        allResults.push(...videos.map((v: any) => ({
          id: v.id,
          type: 'content' as const,
          title: v.title,
          description: v.description,
          image_url: v.thumbnail_url,
          price: v.price_tokens,
          category: v.content_type || 'Video Content',
          url: '/marketplace' // Ideally link to specific item
        })));
      }

      /* 
         Note: Product and Service tables are not yet in the schema. 
         These sections are placeholders for future expansion or should be mapped to specific content types.
      */

      // 4. Search Creators
      const { data: creators } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .ilike('full_name', term)
        .in('role', ['creator', 'innovator', 'visionary'])
        .limit(5);

      if (creators) {
        allResults.push(...creators.map((c: any) => ({
          id: c.id,
          type: 'creator' as const,
          title: c.full_name,
          description: `${c.role.charAt(0).toUpperCase() + c.role.slice(1)} Tier`,
          image_url: c.avatar_url,
          url: `/profile/${c.id}` // Assuming profile pages exist, or marketplace filtered by creator
        })));
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = (type: string) => {
    if (type === 'all') return results;
    return results.filter(r => r.type === type);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'content': return <FileVideo className="h-5 w-5 text-blue-500" />;
      case 'product': return <Package className="h-5 w-5 text-green-500" />;
      case 'service': return <Briefcase className="h-5 w-5 text-purple-500" />;
      case 'creator': return <User className="h-5 w-5 text-orange-500" />;
      default: return <Search className="h-5 w-5" />;
    }
  };

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold mb-2">Search Zariel & Co</h2>
        <p className="text-muted-foreground">Enter a term to search across our marketplace, services, and creators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <Badge variant="outline" className="text-base px-3 py-1">
          &quot;{query}&quot;
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 glass-card">
          <TabsTrigger value="all">All ({results.length})</TabsTrigger>
          <TabsTrigger value="content">Content ({results.filter(r => r.type === 'content').length})</TabsTrigger>
          <TabsTrigger value="creator">Creators ({results.filter(r => r.type === 'creator').length})</TabsTrigger>
        </TabsList>

        {['all', 'content', 'creator'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filterResults(tab).length === 0 ? (
              <Card className="glass-card border-none">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No results found for {tab === 'all' ? 'your search' : `this category`}.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterResults(tab).map((result) => (
                  <Card key={`${result.type}-${result.id}`} className="hover-card glass-card border-none overflow-hidden group">
                    <CardContent className="p-4 flex items-start gap-4">
                      {result.image_url ? (
                        <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img src={result.image_url} alt={result.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0">
                          {getIcon(result.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="secondary" className="text-xs bg-white/10">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                          </Badge>
                          {result.price !== undefined && (
                            <span className="text-sm font-semibold text-green-500">
                              {result.price} Zaryo
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold truncate">{result.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {result.description}
                        </p>
                        <Button variant="link" className="p-0 h-auto text-primary group-hover:underline" onClick={() => router.push(result.url)}>
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
