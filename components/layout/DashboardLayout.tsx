'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-72 h-72 glass rounded-full animate-float opacity-20"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute top-40 right-10 w-96 h-96 glass-dark rounded-full animate-float opacity-20"
          style={{ animationDelay: '2s' }}
        />
        <div 
          className="absolute bottom-20 left-1/2 w-80 h-80 glass rounded-full animate-float opacity-20"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Main Layout Area - Bento Style */}
      <div className="flex-1 p-2 md:p-4 lg:p-6 relative z-10 overflow-hidden flex flex-col gap-4 lg:gap-6 max-w-[1920px] mx-auto w-full h-screen">
        {/* Top Navigation - Logo Navigation */}
        <div className="flex-shrink-0">
          <TopNav />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
          {/* Sidebar Area - Separated */}
          <div className="w-0 lg:w-64 flex-shrink-0 lg:h-full">
             <Sidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 h-full overflow-y-auto rounded-xl lg:rounded-2xl glass-card border border-primary/20 p-3 md:p-4 lg:p-6 no-scrollbar shadow-2xl backdrop-blur-md">
             <div className="animate-fade-in animate-slide-up">
               {children}
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}
