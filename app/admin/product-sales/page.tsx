import { AdminProductPurchases } from '@/components/admin/AdminProductPurchases';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminProductSalesPage() {
  return (
    <DashboardLayout>
      <AdminProductPurchases />
    </DashboardLayout>
  );
}