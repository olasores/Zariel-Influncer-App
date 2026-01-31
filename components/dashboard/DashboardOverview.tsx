'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { CreatorOverview } from '@/components/creator/CreatorOverview';
import { InnovatorOverview } from '@/components/innovator/InnovatorOverview';
import { VisionaryOverview } from '@/components/visionary/VisionaryOverview';

export function DashboardOverview() {
  const { profile } = useAuth();
  
  // Route admin users to AdminOverview
  if (profile && isAdmin(profile)) {
    return <AdminOverview />;
  }

  // Route creators to CreatorOverview (Tier 1)
  if (profile?.role === 'creator') {
    return <CreatorOverview />;
  }

  // Route innovators to InnovatorOverview (Tier 2)
  if (profile?.role === 'innovator') {
    return <InnovatorOverview />;
  }

  // Route visionaries to VisionaryOverview (Tier 3)
  if (profile?.role === 'visionary') {
    return <VisionaryOverview />;
  }

  // Fallback for no profile or unknown role
  return null;
}
