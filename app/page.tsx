'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && profile && !loading) {
      router.push('/dashboard');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="text-center space-y-4 glass-card p-8 rounded-2xl border border-primary/30">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return null; // Will redirect to dashboard
  }

  return <LandingPage />;
}
