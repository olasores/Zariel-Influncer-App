'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Subscription } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsDialog({ open, onOpenChange }: AccountSettingsDialogProps) {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [username, setUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.full_name || '');
    }
  }, [profile?.full_name, open]);

  useEffect(() => {
    if (profile && open) {
      fetchSubscription();
    }
  }, [profile?.id, open]);

  const fetchSubscription = async () => {
    if (!profile) return;

    setLoadingSubscription(true);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .order('current_period_end', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Failed to load subscription', error);
    }

    setSubscription((data as Subscription) || null);
    setLoadingSubscription(false);
  };

  const handleProfileSave = async () => {
    if (!profile || !username.trim()) return;

    setSavingProfile(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: username.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message || 'Unable to update your profile right now.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Profile updated' });
      await refreshProfile();
    }

    setSavingProfile(false);
  };

  const nextBillingDate =
    subscription?.plan_type === 'monthly'
      ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  const membershipLabel = subscription
    ? `${subscription.plan_type === 'monthly' ? 'Monthly' : 'Annual'} · ${
        subscription.status === 'active' ? 'Active' : 'Inactive'
      }`
    : 'No active membership';

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Account settings</DialogTitle>
          <DialogDescription>Update your profile and review billing details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground">Profile</h3>
            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Account Tier</Label>
                <p className="text-sm font-medium mt-1">
                  {profile.role === 'creator' ? 'Tier 1 - Creator' :
                   profile.role === 'innovator' ? 'Tier 2 - Innovator' :
                   profile.role === 'visionary' ? 'Tier 3 - Visionary' :
                   profile.role === 'admin' ? 'Admin' : 'User'}
                </p>
              </div>
              <div>
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium mt-1">{profile.email}</p>
              </div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Add your name"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleProfileSave}
                  disabled={
                    savingProfile ||
                    username.trim() === (profile.full_name?.trim() || '') ||
                    username.trim().length === 0
                  }
                >
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Billing</h3>
            <div className="rounded-lg border p-4 space-y-2">
              {loadingSubscription ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Membership</p>
                      <p className="text-sm text-muted-foreground">{membershipLabel}</p>
                    </div>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {nextBillingDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Next billing date:
                      <span className="ml-1 font-medium text-gray-900">{nextBillingDate}</span>
                    </div>
                  )}
                  {!subscription && (
                    <p className="text-sm text-muted-foreground">
                      Payments are linked to your account, but no active membership was found. Complete checkout to activate access.
                    </p>
                  )}
                </>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/subscription">Manage membership</Link>
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
