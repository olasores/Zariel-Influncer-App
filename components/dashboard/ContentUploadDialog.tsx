'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Subscription, ContentType } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  subscription: Subscription | null;
}

const CONTENT_TYPE_CONFIG = {
  video: {
    label: 'Video',
    accept: 'video/*',
    maxSize: 50,
    description: '10-60 seconds recommended',
  },
  image: {
    label: 'Image',
    accept: 'image/*',
    maxSize: 10,
    description: 'High-quality images, infographics, designs',
  },
  audio: {
    label: 'Audio',
    accept: 'audio/*',
    maxSize: 20,
    description: 'Music, podcasts, sound effects',
  },
  document: {
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt,.ppt,.pptx',
    maxSize: 15,
    description: 'Scripts, presentations, PDFs',
  },
  other: {
    label: 'Other',
    accept: '*',
    maxSize: 25,
    description: 'Any other file type',
  },
};

export function ContentUploadDialog({ open, onOpenChange, onSuccess, subscription }: ContentUploadDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !file) return;

    setUploading(true);
    setError('');

    try {
      const config = CONTENT_TYPE_CONFIG[contentType];
      const maxSizeBytes = config.maxSize * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        throw new Error(`File must be less than ${config.maxSize}MB`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('videos').insert({
        creator_id: profile.id,
        title,
        description,
        content_url: publicUrl,
        content_type: contentType,
        price_tokens: 0, // Default to 0, admin will set the price
        file_size: file.size,
        file_extension: fileExt,
        status: 'active',
      });

      if (insertError) throw insertError;

      // Only update subscription counter for non-admin users
      if (subscription && !profile.is_admin) {
        await supabase
          .from('subscriptions')
          .update({
            videos_uploaded_this_period: subscription.videos_uploaded_this_period + 1,
            last_video_uploaded_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }

      toast({
        title: 'Success',
        description: 'Content uploaded successfully! Admin will set the price.',
      });

      setTitle('');
      setDescription('');
      setFile(null);
      setContentType('video');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload content');
    } finally {
      setUploading(false);
    }
  };

  const config = CONTENT_TYPE_CONFIG[contentType];
  const isAdminUser = profile ? isAdmin(profile) : false;
  const isTier1Creator = profile?.role === 'creator';
  const subscriptionAllowsUploads =
    !!subscription && new Date(subscription.current_period_end).getTime() > Date.now();
  // Tier 1 creators and admins can upload for free, tier 2/3 need subscription
  const uploadLocked = !isAdminUser && !isTier1Creator && !subscriptionAllowsUploads;

  // Debug logging
  if (open) {
    console.log('ContentUploadDialog Debug:', {
      isAdminUser,
      profileIsAdmin: profile?.is_admin,
      profileEmail: profile?.email,
      subscription,
      subscriptionAllowsUploads,
      uploadLocked
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
          <DialogDescription>
            Share your content idea - videos, images, audio, documents, and more.
            {isAdminUser && (
              <span className="block mt-1 text-sm text-blue-600 font-medium">
                Admin: Unlimited uploads
              </span>
            )}
            {!isAdminUser && subscription && (
              <span className="block mt-1 text-sm">
                {subscription.videos_uploaded_this_period}/10 items uploaded this period
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {uploadLocked ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              Uploads unlock once you activate a creator membership.
            </p>
            <Button asChild>
              <Link href="/subscription">View membership plans</Link>
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>

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
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept={config.accept}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Max file size: {config.maxSize}MB
            </p>
            {file && (
              <p className="text-xs text-green-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
