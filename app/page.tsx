'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { CreatorDashboard } from '@/components/dashboard/CreatorDashboard';
import { CompanyDashboard } from '@/components/dashboard/CompanyDashboard';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ZARIEL & Co
            </h1>
            <h2 className="text-3xl font-semibold text-gray-800">
              Influencer Marketplace
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A revolutionary platform connecting content creators with companies through our
              proprietary token ecosystem. Upload your content ideas, earn tokens, and collaborate
              on innovative concepts.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-blue-600 mb-2">For Creators</h3>
                <p className="text-sm text-gray-600">
                  Upload portfolio videos, earn tokens from sales
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-cyan-600 mb-2">For Companies</h3>
                <p className="text-sm text-gray-600">
                  Discover content concepts, collaborate with creators
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            {showLogin ? (
              <LoginForm
                onSuccess={() => {}}
                onSwitchToSignup={() => setShowLogin(false)}
              />
            ) : (
              <SignupForm
                onSuccess={() => {}}
                onSwitchToLogin={() => setShowLogin(true)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return <DashboardHome />;
}

function DashboardHome() {
  const { DashboardLayout } = require('@/components/layout/DashboardLayout');
  const { DashboardOverview } = require('@/components/dashboard/DashboardOverview');

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
