'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminSubscription } from '@/components/admin/AdminSubscription';
import { CreatorSubscription } from '@/components/creator/CreatorSubscription';
import { CompanySubscription } from '@/components/company/CompanySubscription';

export function SubscriptionPageContent() {
  const { profile } = useAuth();
  
  // Route admin users to AdminSubscription
  if (profile && isAdmin(profile)) {
    return <AdminSubscription />;
  }

  // Route creators to CreatorSubscription
  if (profile?.role === 'creator') {
    return <CreatorSubscription />;
  }

  // Route companies to CompanySubscription
  if (profile?.role === 'company') {
    return <CompanySubscription />;
  }

  // Fallback for no profile or unknown role
  return null;
}
