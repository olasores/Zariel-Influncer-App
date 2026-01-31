'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { CreatorOverview } from '@/components/creator/CreatorOverview';
import { CompanyOverview } from '@/components/company/CompanyOverview';

export function DashboardOverview() {
  const { profile } = useAuth();
  
  // Route admin users to AdminOverview
  if (profile && isAdmin(profile)) {
    return <AdminOverview />;
  }

  // Route creators to CreatorOverview
  if (profile?.role === 'creator') {
    return <CreatorOverview />;
  }

  // Route companies to CompanyOverview
  if (profile?.role === 'innovator' || profile?.role === 'visionary') {
    return <CompanyOverview />;
  }

  // Fallback for no profile or unknown role
  return null;
}
