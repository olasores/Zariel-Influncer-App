'use client';

import { useState, useEffect } from 'react';
import { Content, Profile } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Trash2, Eye, FileText, Music, Image as ImageIcon, Film, Building2, User, Gavel } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { BidDialog } from './BidDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContentCardProps {
  content: Content;
  onUpdate: () => void;
  showPurchase?: boolean;
  onPurchase?: (content: Content) => void;
  showBidding?: boolean;
  userBalance?: number;
}

export function ContentCard({ content, onUpdate, showPurchase = false, onPurchase, showBidding = false, userBalance = 0 }: ContentCardProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);

  // Check if user can bid (All innovators, visionaries and Admins)
  const canBid = showBidding && profile && (
    isAdmin(profile) || profile.role === 'innovator' || profile.role === 'visionary'
  );

  useEffect(() => {
    fetchCreatorProfile();
  }, [content.creator_id]);

  const fetchCreatorProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', content.creator_id)
      .maybeSingle();

    if (data) {
      setCreatorProfile(data as Profile);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });

      onUpdate();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'sold':
        return 'bg-blue-600';
      case 'archived':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderPreview = () => {
    switch (content.content_type) {
      case 'video':
        return (
          <video
            src={content.content_url}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        );
      case 'image':
        return (
          <img
            src={content.content_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        );
      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <Music className="h-16 w-16 text-purple-600 mb-4" />
            <audio src={content.content_url} controls className="w-11/12" />
          </div>
        );
      case 'document':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
            <FileText className="h-16 w-16 text-blue-600 mb-2" />
            <p className="text-sm text-blue-700 font-medium">{content.file_extension?.toUpperCase()}</p>
            <a
              href={content.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs text-blue-600 hover:underline"
            >
              View Document
            </a>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <FileText className="h-16 w-16 text-gray-600 mb-2" />
            <p className="text-sm text-gray-700 font-medium">{content.file_extension?.toUpperCase()}</p>
            <a
              href={content.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs text-gray-600 hover:underline"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-muted">
        {renderPreview()}
        <Badge className={`absolute top-2 right-2 ${getStatusColor(content.status)}`}>
          {content.status}
        </Badge>
        <Badge className="absolute top-2 left-2 bg-white text-gray-700 flex items-center gap-1">
          {getContentTypeIcon(content.content_type)}
          {getContentTypeLabel(content.content_type)}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 flex-1">{content.title}</h3>
          {creatorProfile && (
            <Badge variant="outline" className="flex items-center gap-1">
              {creatorProfile.role === 'innovator' || creatorProfile.role === 'visionary' ? (
                <>
                  <Building2 className="h-3 w-3" />
                  Company
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  Creator
                </>
              )}
            </Badge>
          )}
        </div>
        {content.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-yellow-600">
            <Coins className="h-4 w-4 mr-1" />
            <span className="font-semibold">{content.price_tokens} Zaryo</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(content.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
        {(content.bid_count && content.bid_count > 0) && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Gavel className="h-3 w-3" />
              {content.bid_count} {content.bid_count === 1 ? 'Bid' : 'Bids'}
            </Badge>
            {content.highest_bid && (
              <span className="text-green-600 font-medium">
                Highest: {content.highest_bid} Zaryo
              </span>
            )}
          </div>
        )}
        {content.file_size && (
          <p className="text-xs text-muted-foreground">
            Size: {(content.file_size / 1024 / 1024).toFixed(2)}MB
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        {canBid ? (
          <div className="flex gap-2 w-full">
            {content.status === 'active' ? (
              <BidDialog
                contentId={content.id}
                contentTitle={content.title}
                currentPrice={content.price_tokens}
                currentHighestBid={content.highest_bid || undefined}
                userBalance={userBalance}
                trigger={
                  <Button variant="default" className="flex-1">
                    <Gavel className="mr-2 h-4 w-4" />
                    Place Bid
                  </Button>
                }
              />
            ) : (
              <Button variant="default" className="flex-1" disabled>
                <Gavel className="mr-2 h-4 w-4" />
                {content.status === 'sold' ? 'Sold' : 'Not Available'}
              </Button>
            )}
          </div>
        ) : (
          <>
            <Button variant="outline" className="flex-1" size="sm" asChild>
              <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Content</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this content? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
