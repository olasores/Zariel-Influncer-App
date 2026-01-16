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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const getNavigation = (role?: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'My Content', href: '/my-content', icon: FileVideo },
    { name: 'My Purchases', href: '/my-purchases', icon: ShoppingBag },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Token Management', href: '/token-management', icon: Coins },
  ];

  return baseNavigation;
};

export function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg border border-gray-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Zariel & Co</h1>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            {profile && (
              <div className="px-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            )}

            <nav className="space-y-1 px-3">
              {getNavigation(profile?.role).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-blue-700' : 'text-gray-400'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
