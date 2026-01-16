import { TokenManagementPage } from '@/components/pages/TokenManagementPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TokenManagement() {
  return (
    <DashboardLayout>
      <TokenManagementPage />
    </DashboardLayout>
  );
}
