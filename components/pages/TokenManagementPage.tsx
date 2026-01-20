'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { AdminTokenManagement } from '@/components/admin/AdminTokenManagement';

export function TokenManagementPage() {
  const { profile } = useAuth();
  
  // Route admin users to AdminTokenManagement
  if (profile && isAdmin(profile)) {
    return <AdminTokenManagement />;
  }

  // Token management is admin-only
  return null;
}
