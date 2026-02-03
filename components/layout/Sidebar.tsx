'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  FileVideo,
  ShoppingBag,
  Coins,
  CreditCard,
  LogOut,
  Menu,
  X,
  Settings,
  UserRound,
  HelpCircle,
  Gavel,
  Briefcase,
  Package,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AccountSettingsDialog } from '@/components/layout/AccountSettingsDialog';
import { HelpDialog } from '@/components/layout/HelpDialog';

const getNavigation = (role?: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    {
      name: 'Services & Bookings',
      icon: Briefcase,
      isDropdown: true,
      children: [
        { name: 'Services', href: '/services', icon: Briefcase },
        { name: 'Booking Requests', href: '/my-services', icon: Briefcase },
        { name: 'My Bookings', href: '/my-bookings', icon: ShoppingBag },
      ]
    },
    {
      name: 'Content & Marketplace',
      icon: Store,
      isDropdown: true,
      children: [
        { name: 'Marketplace', href: '/marketplace', icon: Store },
        { name: 'My Content', href: '/my-content', icon: FileVideo },
        { name: 'Content Bids', href: '/content-bids', icon: Gavel },
      ]
    },
    { name: 'My Purchases', href: '/my-purchases', icon: ShoppingBag },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Token Management', href: '/token-management', icon: Coins }
  ];

  return baseNavigation;
};

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Auto-open dropdowns if on a child page
  useEffect(() => {
    const navigation = getNavigation(profile?.role);
    const newOpenDropdowns: Record<string, boolean> = {};

    navigation.forEach(item => {
      if (item.isDropdown && item.children) {
        const isChildActive = item.children.some(child => pathname === child.href);
        if (isChildActive) {
          newOpenDropdowns[item.name] = true;
        }
      }
    });
    
    setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
  }, [pathname, profile]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSignOut = () => {
    console.log('🔘 Sidebar: Sign out button clicked');
    // Force immediate logout without waiting for async operations
    if (typeof window !== 'undefined') {
      // Clear all storage immediately
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.error('Storage clear error:', e);
      }
      // Immediate redirect
      window.location.href = '/';
    }
  };

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-md glass-card shadow-lg border border-primary/20"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-primary" />
        ) : (
          <Menu className="h-6 w-6 text-primary" />
        )}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 glass-nav backdrop-blur-xl border-r border-primary/20 transform transition-transform duration-200 ease-in-out lg:static lg:z-0 lg:transform-none lg:w-full lg:h-full lg:glass-card lg:border-primary/20 lg:rounded-2xl lg:bg-clip-padding',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo removed - now in TopNav */}
          <div className="h-4"></div>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 mb-2 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Menu
              </p>
            </div>
            <nav className="space-y-1 px-3">
              {getNavigation(profile?.role).map((item) => {
                if (item.isDropdown) {
                  const hasActiveChild = item.children?.some(child => pathname === child.href);
                  const isOpen = openDropdowns[item.name];

                  return (
                    <div key={item.name}>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-500 ease-out',
                            hasActiveChild || isOpen
                              ? 'glass-card border border-accent/30 text-accent'
                              : 'text-primary hover:glass-card hover:text-accent'
                          )}
                        >
                        <div className="flex items-center">
                          <item.icon
                            className={cn(
                              'mr-3 h-5 w-5 flex-shrink-0',
                              hasActiveChild || isOpen ? 'text-accent' : 'text-muted-foreground'
                            )}
                          />
                          {item.name}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div 
                        className={cn(
                          "grid transition-all duration-300 ease-in-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          {/* Tree/Leveling Visuals */}
                          <div className="relative mt-1 mb-1">
                            {/* Main Trunk Line */}
                            <div className="absolute left-[1.65rem] top-0 bottom-5 w-[2px] bg-primary/10 rounded-full z-0" />
                            
                            {item.children?.map((child) => {
                              const isActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    'group flex items-center pl-14 pr-3 py-2 text-sm font-medium rounded-r-lg transition-all duration-300 ease-out relative my-0.5',
                                    isActive
                                      ? 'text-accent bg-accent/5'
                                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                                  )}
                                >
                                  {/* Arrow Connector */}
                                  <div className="absolute left-[1.65rem] top-1/2 -translate-y-1/2 flex items-center">
                                    {/* Horizontal Line */}
                                    <div className={cn(
                                      "w-5 h-[2px] transition-colors duration-300",
                                      isActive ? "bg-accent" : "bg-primary/10 group-hover:bg-accent/40"
                                    )} />
                                    {/* Arrow Head */}
                                    <ChevronRight className={cn(
                                      "h-3 w-3 -ml-1 transition-all duration-300",
                                      isActive ? "text-accent stroke-[3]" : "text-primary/20 group-hover:text-accent/60"
                                    )} />
                                  </div>

                                  <child.icon
                                    className={cn(
                                      'mr-3 h-4 w-4 flex-shrink-0 transition-transform duration-300',
                                      isActive ? 'text-accent scale-110' : 'text-muted-foreground group-hover:scale-110 group-hover:text-primary'
                                    )}
                                  />
                                  <span className={cn(
                                    "transition-all duration-300", 
                                    isActive ? "font-semibold translate-x-1" : "group-hover:translate-x-1"
                                  )}>
                                    {child.name}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-500 ease-out',
                      isActive
                        ? 'glass-card border border-accent/30 text-accent'
                        : 'text-primary hover:glass-card hover:text-accent'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-accent' : 'text-muted-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-primary/20 p-4 space-y-1">
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Support
              </p>
            </div>
            
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-primary hover:glass-card hover:text-accent transition-all duration-500 ease-out group"
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-accent" />
              Settings
            </button>

            <button
              onClick={() => setHelpOpen(true)}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-primary hover:glass-card hover:text-accent transition-all duration-500 ease-out group"
            >
              <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-accent" />
              Info
            </button>

            <div className="pt-4 mt-2">
              <Button
                variant="outline"
                className="w-full justify-start glass-card border-accent/30 text-primary hover:text-accent hover:border-accent/50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
