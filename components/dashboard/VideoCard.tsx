'use client';

import { Video } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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

interface VideoCardProps {
  video: Video;
  onUpdate: () => void;
  showPurchase?: boolean;
  onPurchase?: (video: Video) => void;
}

export function VideoCard({ video, onUpdate, showPurchase = false, onPurchase }: VideoCardProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });

      onUpdate();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete video',
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

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <video
          src={video.video_url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}>
          {video.status}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-yellow-600">
            <Coins className="h-4 w-4 mr-1" />
            <span className="font-semibold">{video.price_tokens} Tokens</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(video.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        {showPurchase ? (
          <Button
            className="w-full"
            onClick={() => onPurchase?.(video)}
            disabled={video.status !== 'active'}
          >
            <Coins className="mr-2 h-4 w-4" />
            Purchase Concept
          </Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Video</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this video? This action cannot be undone.
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
