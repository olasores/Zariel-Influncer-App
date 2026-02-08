'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A7D129] to-[#6A7B92] rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <span className="text-2xl font-black text-white">Z</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-gradient-to-r from-[#6A7B92] to-[#A7D129] bg-clip-text text-transparent leading-tight">
                Zariel & Co
              </span>
              <span className="text-xs font-bold text-gray-500 leading-tight">
                Influencer Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-[#A7D129] font-semibold transition-colors">
              How it works
            </button>
            <button onClick={() => scrollToSection('categories')} className="text-gray-700 hover:text-[#A7D129] font-semibold transition-colors">
              Categories
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-[#A7D129] font-semibold transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-[#A7D129] font-semibold transition-colors">
              Success Stories
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-semibold text-gray-700 hover:text-[#A7D129] hover:bg-[#A7D129]/10">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-[#A7D129] to-[#95c51f] hover:from-[#95c51f] hover:to-[#A7D129] text-white font-bold px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 space-y-4">
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-3 text-gray-700 font-semibold">
                How it works
              </button>
              <button onClick={() => scrollToSection('categories')} className="block w-full text-left py-3 text-gray-700 font-semibold">
                Categories
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-3 text-gray-700 font-semibold">
                Pricing
              </button>
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/auth/signup" className="block">
                <Button className="w-full bg-[#A7D129] hover:bg-[#95c51f]">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
