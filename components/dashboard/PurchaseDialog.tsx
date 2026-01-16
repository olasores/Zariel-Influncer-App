'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content, TokenWallet } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Coins, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content;
  wallet: TokenWallet | null;
  onSuccess: () => void;
}

export function PurchaseDialog({ open, onOpenChange, content, wallet, onSuccess }: PurchaseDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    if (!profile || !wallet) return;

    if (wallet.balance < content.price_tokens) {
      setError('Insufficient token balance');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const { data: creatorWallet } = await supabase
        .from('token_wallets')
        .select('*')
        .eq('user_id', content.creator_id)
        .maybeSingle();

      if (!creatorWallet) {
        throw new Error('Creator wallet not found');
      }

      const { error: purchaseError } = await supabase.from('purchases').insert({
        video_id: content.id,
        creator_id: content.creator_id,
        company_id: profile.id,
        tokens_paid: content.price_tokens,
        notes,
        status: 'completed',
      });

      if (purchaseError) throw purchaseError;

      await supabase
        .from('token_wallets')
        .update({
          balance: wallet.balance - content.price_tokens,
          total_spent: wallet.total_spent + content.price_tokens,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.id);

      await supabase
        .from('token_wallets')
        .update({
          balance: creatorWallet.balance + content.price_tokens,
          total_earned: creatorWallet.total_earned + content.price_tokens,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', content.creator_id);

      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('id')
        .eq('video_id', content.id)
        .eq('company_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (purchaseData) {
        await supabase.from('token_transactions').insert({
          from_user_id: profile.id,
          to_user_id: content.creator_id,
          amount: content.price_tokens,
          transaction_type: 'purchase',
          reference_id: purchaseData.id,
          description: `Purchase of content: ${content.title}`,
          status: 'completed',
        });
      }

      await supabase
        .from('videos')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      toast({
        title: 'Success',
        description: 'Content concept purchased successfully!',
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const canAfford = wallet && wallet.balance >= content.price_tokens;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Content Concept</DialogTitle>
          <DialogDescription>Review the details and complete your purchase</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!canAfford && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have enough Zaryo. Current balance: {wallet?.balance || 0} Zaryo. Required: {content.price_tokens} Zaryo.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {content.content_type === 'video' ? (
                <video src={content.content_url} className="w-full h-full object-cover" controls />
              ) : content.content_type === 'image' ? (
                <img src={content.content_url} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <a href={content.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Content
                  </a>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              {content.description && (
                <p className="text-muted-foreground">{content.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium">Purchase Price</span>
              <div className="flex items-center text-yellow-600">
                <Coins className="h-5 w-5 mr-2" />
                <span className="text-xl font-bold">{content.price_tokens} Zaryo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or collaboration details..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={purchasing}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={purchasing || !canAfford}>
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Complete Purchase
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
