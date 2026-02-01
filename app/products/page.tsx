import { ProductMarketplace } from '@/components/marketplace/ProductMarketplace';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductMarketplace />
    </DashboardLayout>
  );
}