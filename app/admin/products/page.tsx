import { AdminProductManager } from '@/components/admin/AdminProductManager';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminProductsPage() {
  return (
    <DashboardLayout>
      <AdminProductManager />
    </DashboardLayout>
  );
}