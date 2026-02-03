'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Dashboard entrance animation delay
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="text-center space-y-4 animate-scale-in glass-card p-8 rounded-2xl border border-primary/30">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
      <DashboardLayout>
        {/* Animation handled by layout */}
        <DashboardOverview />
      </DashboardLayout>
    </div>
  );
}