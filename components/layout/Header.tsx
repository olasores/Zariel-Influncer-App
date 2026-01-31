'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins, LogOut, Settings } from 'lucide-react';
import { AccountSettingsDialog } from '@/components/layout/AccountSettingsDialog';

export function Header() {
  const { profile, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Subscribe to profile changes for real-time token balance updates
  useEffect(() => {
    if (!profile) return;

    const subscription = supabase
      .channel(`profile-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        () => {
          // Profile will be automatically refreshed by AuthContext
          console.log('Profile updated, AuthContext will refresh');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile]);

  if (!profile) return null;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ZARIEL & Co
          </h1>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {profile.role === 'creator' ? 'Tier 1 - Creator' : 
             profile.role === 'innovator' ? 'Tier 2 - Innovator' : 
             profile.role === 'visionary' ? 'Tier 3 - Visionary' : 
             profile.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {profile.token_balance !== undefined && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">
                {profile.token_balance.toLocaleString()} Zaryo
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}
