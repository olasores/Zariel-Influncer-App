'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { VideoUploadDialog } from '@/components/dashboard/VideoUploadDialog';
import { Plus, FileVideo } from 'lucide-react';
import { Content, Subscription } from '@/lib/supabase';

export function MyContentPage() {
  const { profile } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (profile?.role === 'creator') {
      loadContent();
      loadSubscription();
    }
  }, [profile]);

  const loadContent = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .maybeSingle();

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    loadContent();
    loadSubscription();
  };

  if (profile?.role !== 'creator') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Creator Access Only
            </h3>
            <p className="text-gray-500 text-center">
              This page is only available for creators
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Content</h2>
          <p className="text-gray-600 mt-1">
            Manage your uploaded videos, images, and content
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </div>

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
      ) : content.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Start uploading your first content to share with companies
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <ContentCard key={item.id} content={item} onUpdate={loadContent} />
          ))}
        </div>
      )}

      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        subscription={subscription}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
