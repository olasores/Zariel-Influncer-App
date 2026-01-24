'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Coins, SendHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RedeemTokensDialogProps {
  walletBalance: number;
  onSuccess: () => void;
}

export function RedeemTokensDialog({ walletBalance, onSuccess }: RedeemTokensDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    tokenCount: '',
    paymentMethod: '',
    accountUsername: '',
    phoneNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const tokenCount = parseInt(formData.tokenCount);

      if (isNaN(tokenCount) || tokenCount <= 0) {
        throw new Error('Please enter a valid token count');
      }

      if (tokenCount > walletBalance) {
        throw new Error('Insufficient token balance');
      }

      if (!formData.paymentMethod) {
        throw new Error('Please select a payment method');
      }

      if (!formData.accountUsername) {
        throw new Error('Please enter your account username');
      }

      if (!formData.phoneNumber) {
        throw new Error('Please enter your phone number');
      }

      // Create redemption request
      const { error } = await supabase
        .from('redemption_requests')
        .insert({
          user_id: profile.id,
          name: formData.name,
          token_count: tokenCount,
          payment_method: formData.paymentMethod,
          account_username: formData.accountUsername,
          phone_number: formData.phoneNumber,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your redemption request has been submitted. An admin will review it shortly.',
      });

      setOpen(false);
      setFormData({
        name: profile?.full_name || '',
        tokenCount: '',
        paymentMethod: '',
        accountUsername: '',
        phoneNumber: '',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting redemption request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit redemption request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <SendHorizontal className="h-4 w-4 mr-2" />
          Redeem Tokens
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Zaryo Tokens</DialogTitle>
          <DialogDescription>
            Submit a request to redeem your tokens for cash. An admin will process your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Available Balance</Label>
            <div className="text-2xl font-bold text-yellow-600 flex items-center gap-2 mt-1">
              <Coins className="h-6 w-6" />
              {walletBalance.toLocaleString()} Zaryo
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="token-count">Token Count *</Label>
            <Input
              id="token-count"
              type="number"
              min="1"
              max={walletBalance}
              value={formData.tokenCount}
              onChange={(e) => setFormData({ ...formData, tokenCount: e.target.value })}
              placeholder="Enter number of tokens to redeem"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {walletBalance.toLocaleString()} tokens
            </p>
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="cashapp">Cash App</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account-username">Account Username/Email *</Label>
            <Input
              id="account-username"
              value={formData.accountUsername}
              onChange={(e) => setFormData({ ...formData, accountUsername: e.target.value })}
              placeholder="e.g., @yourhandle or email@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your username, email, or account ID for the selected payment method
            </p>
          </div>

          <div>
            <Label htmlFor="phone-number">Phone Number *</Label>
            <Input
              id="phone-number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="e.g., +1 (555) 123-4567"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We may contact you to verify your identity
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Token redemption is processed manually by our team.
              You will be contacted to verify your payment details before processing.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
