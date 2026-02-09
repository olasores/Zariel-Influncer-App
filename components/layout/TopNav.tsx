'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Settings, LogOut, User, ChevronDown, MessageCircle } from 'lucide-react';
import { AccountSettingsDialog } from './AccountSettingsDialog';

interface AppNotification {
  id: string;
  title: string;
  time: string;
}

export function TopNav() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.length;
  const chatActive = pathname?.startsWith('/chat');

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Storage clear error:', e);
      }
      window.location.href = '/';
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'creator':
        return 'Tier 1 - Creator';
      case 'innovator':
        return 'Tier 2 - Innovator';
      case 'visionary':
        return 'Tier 3 - Visionary';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    if (!profile) return;

    const loadNotifications = async () => {
      try {
        const userId = profile.id;

        const [txResult, bookingResult] = await Promise.all([
          supabase
            .from('token_transactions')
            .select('id, amount, transaction_type, description, created_at, from_user_id, to_user_id')
            .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('service_bookings')
            .select('id, created_at, status, services(title), service_owner_id, user_id')
            .or(`service_owner_id.eq.${userId},user_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const txNotifications = (txResult.data || []).map((tx: any) => ({
          id: `tx-${tx.id}`,
          title:
            tx.description ||
            (tx.transaction_type === 'purchase'
              ? `Purchase • ${tx.amount} Zaryo`
              : `Transaction • ${tx.amount} Zaryo`),
          time: new Date(tx.created_at).toLocaleString(),
        }));

        const bookingNotifications = (bookingResult.data || []).map((b: any) => ({
          id: `booking-${b.id}`,
          title: `Booking ${b.status} • ${b.services?.title || 'Service'}`,
          time: new Date(b.created_at).toLocaleString(),
        }));

        const all = [...txNotifications, ...bookingNotifications]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);

        setNotifications(all);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [profile]);

  return (
    <>
      <nav className="h-16 glass-card rounded-2xl flex items-center justify-between pl-14 pr-3 lg:px-6 relative z-30 lg:ml-0">
        {/* Left side - Zariel branding */}
        <div className="flex items-center">
          <div className="flex flex-col animate-fade-in">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary leading-none whitespace-nowrap">
              Zariel & Co
            </h1>
            <span className="text-[10px] md:text-xs text-muted-foreground leading-none hidden sm:block mt-1">
              Influencer Marketplace
            </span>
          </div>
        </div>

        {/* Center - Search Bar Spacer */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block"></div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant={chatActive ? 'secondary' : 'ghost'}
              className={`h-10 rounded-full border border-primary/10 hover:border-accent/50 transition-colors ${chatActive ? 'bg-accent/10 text-accent' : 'text-primary'}`}
            >
              <Link href="/chat" className="flex items-center gap-2 px-3">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Link>
            </Button>

            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 hover:glass-card text-muted-foreground hover:text-accent"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] max-w-[94vw] bg-white/95 backdrop-blur-xl border-primary/20 shadow-xl z-50 mr-1 sm:mr-0" align="end" sideOffset={8}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary">Notifications</h3>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                      NEW
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        No notifications yet. New bookings and transactions will appear here.
                      </div>
                    )}
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-lg transition-all duration-500 ease-out hover:bg-accent/5 border border-accent/10"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-primary/10">
                    <Button asChild variant="ghost" className="w-full text-accent hover:glass-card">
                      <Link href="/token-management">View all notifications</Link>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 md:h-12 w-10 md:w-auto md:gap-3 p-0 md:px-3 rounded-full border border-primary/10 bg-white/40 hover:bg-white/60 hover:border-accent/50 transition-all duration-300 group">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:border-accent transition-colors">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="bg-accent text-white text-xs font-bold">
                      {getUserInitials(profile?.full_name || undefined, profile?.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start text-left min-w-0 pr-1">
                    <span className="text-sm font-bold text-primary truncate max-w-[120px]">
                      {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs font-medium text-accent">
                      {getRoleDisplay(profile?.role)}
                    </span>
                  </div>
                  <div className="hidden md:block text-muted-foreground/50 group-hover:text-accent transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-primary/20 p-2 shadow-xl z-50 mr-4 md:mr-0" align="end" sideOffset={8}>
                <DropdownMenuLabel className="text-primary md:hidden mx-2 mt-1 mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{getRoleDisplay(profile?.role)}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/10 md:hidden" />

                <DropdownMenuLabel className="text-primary hidden md:block">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem
                  onClick={() => setSettingsOpen(true)}
                  className="hover:glass-card text-primary cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="hover:glass-card text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </nav>

      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}