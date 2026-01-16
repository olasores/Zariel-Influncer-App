'use client';

import { useAuth } from '@/contexts/AuthContext';
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
import { Coins, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, TokenWallet } from '@/lib/supabase';

export function Header() {
  const { profile, signOut } = useAuth();
  const [wallet, setWallet] = useState<TokenWallet | null>(null);

  useEffect(() => {
    if (profile) {
      fetchWallet();
    }
  }, [profile]);

  const fetchWallet = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('token_wallets')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (data) {
      setWallet(data as TokenWallet);
    }
  };

  if (!profile) return null;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ZARIEL & Co
          </h1>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {profile.role === 'creator' ? 'Creator' : 'Company'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {wallet && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">
                {wallet.balance.toLocaleString()} Zaryo
              </span>
            </div>
          )}

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
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
