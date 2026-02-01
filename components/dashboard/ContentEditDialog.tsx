'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content, ContentType } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  onSuccess: () => void;
}

export function ContentEditDialog({ open, onOpenChange, content, onSuccess }: ContentEditDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceTokens, setPriceTokens] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdminUser = profile ? isAdmin(profile) : false;

  // Populate form when content changes
  useEffect(() => {
    if (content && open) {
      setTitle(content.title);
      setDescription(content.description || '');
      setPriceTokens(content.price_tokens?.toString() || '0');
      setStatus(content.status === 'active' ? 'active' : 'archived');
      setContentType(content.content_type || 'video');
      setError('');
    }
  }, [content, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !content) return;

    // Check if user owns the content or is admin
    const canEdit = content.creator_id === profile.id || isAdminUser;
    if (!canEdit) {
      setError('You can only edit your own content');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updates: Partial<Content> = {
        title,
        description,
        status,
        content_type: contentType,
        updated_at: new Date().toISOString(),
      };

      // Only allow price editing for admins or creators editing their own content
      if (isAdminUser || content.creator_id === profile.id) {
        updates.price_tokens = parseInt(priceTokens) || 0;
      }

      const { error: updateError } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', content.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Content updated successfully!',
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update your content details. {isAdminUser ? 'As an admin, you can edit any content.' : 'You can only edit your own content.'}
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
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'active' | 'archived') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (Zaryo Tokens)</Label>
            <Input
              id="price"
              type="number"
              value={priceTokens}
              onChange={(e) => setPriceTokens(e.target.value)}
              placeholder="0"
              min="0"
              disabled={!isAdminUser && content?.creator_id !== profile?.id}
            />
            {!isAdminUser && content?.creator_id !== profile?.id && (
              <p className="text-xs text-muted-foreground">
                Only content creators and admins can edit the price
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}