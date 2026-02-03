'use client';

import { useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { AccountSettingsDialog } from './AccountSettingsDialog';

export function TopNav() {
  const { profile, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

  // Mock notifications - you can replace this with real data
  const notifications = [
    { id: 1, title: 'New content bid received', time: '2 min ago', unread: true },
    { id: 2, title: 'Payment processed successfully', time: '1 hour ago', unread: true },
    { id: 3, title: 'Profile updated', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg transition-all duration-500 ease-out ${ 
                          notification.unread 
                            ? 'bg-accent/5 border border-accent/20' 
                            : 'hover:bg-accent/5'
                        }`}
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
                          {notification.unread && (
                            <div className="w-2 h-2 bg-accent rounded-full mt-1 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-primary/10">
                    <Button variant="ghost" className="w-full text-accent hover:glass-card">
                      View all notifications
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