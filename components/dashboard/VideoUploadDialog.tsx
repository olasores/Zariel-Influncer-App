'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Subscription } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  subscription: Subscription | null;
}

export function VideoUploadDialog({ open, onOpenChange, onSuccess, subscription }: VideoUploadDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceTokens, setPriceTokens] = useState('100');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !videoFile) return;

    setUploading(true);
    setError('');

    try {
      if (videoFile.size > 10 * 1024 * 1024) {
        throw new Error('Video file must be less than 10MB');
      }

      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('videos').insert({
        creator_id: profile.id,
        title,
        description,
        video_url: publicUrl,
        price_tokens: parseInt(priceTokens),
        status: 'active',
      });

      if (insertError) throw insertError;

      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({
            videos_uploaded_this_period: subscription.videos_uploaded_this_period + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }

      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
      });

      setTitle('');
      setDescription('');
      setPriceTokens('100');
      setVideoFile(null);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Video Content</DialogTitle>
          <DialogDescription>
            Share your content idea. Videos should be 10-15 seconds long.
            {subscription && (
              <span className="block mt-1 text-sm">
                {subscription.videos_uploaded_this_period}/10 videos uploaded this period
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your content"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content idea and concept"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceTokens">Price (Tokens)</Label>
            <Input
              id="priceTokens"
              type="number"
              value={priceTokens}
              onChange={(e) => setPriceTokens(e.target.value)}
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground">
              Set a token price for your content concept
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Max file size: 10MB. Recommended: 10-15 seconds
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !videoFile}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
