'use client';

import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { StatsBar } from './StatsBar';
import { Categories } from './Categories';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { Pricing } from './Pricing';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Enhanced Floating Elements Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#A7D129]/20 via-[#A7D129]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-20 w-[600px] h-[600px] bg-gradient-to-br from-[#6A7B92]/15 via-[#6A7B92]/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-[#A7D129]/15 via-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Accent shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-[#A7D129]/10 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-[#6A7B92]/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(106, 123, 146) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <Navigation />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Categories />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
