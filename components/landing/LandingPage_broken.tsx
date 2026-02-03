'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Coins, 
  Zap, 
  Shield, 
  ArrowRight,
  Play,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Creator Marketplace',
      description: 'Showcase your content and connect with brands looking for authentic voices'
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: 'Zaryo Token Economy',
      description: 'Earn and spend Zaryo tokens for seamless content transactions'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Smart Bidding System',
      description: 'Brands can bid on content, creators choose the best offers'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Multi-Tier Access',
      description: 'Flexible tiers for creators, innovators, and visionaries'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Transactions',
      description: 'Built-in wallet system ensures safe and transparent payments'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Access',
      description: 'Purchase content and products directly with Zaryo tokens'
    }
  ];

  const benefits = [
    'Monetize your creative content',
    'Connect with global brands',
    'Transparent pricing with tokens',
    'Secure digital transactions',
    'Real-time marketplace',
    'Subscription-based uploads'
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-72 h-72 glass rounded-full animate-float"
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="absolute top-40 right-10 w-96 h-96 glass-dark rounded-full animate-float"
            style={{ animationDelay: '2s' }}
          />
          <div 
            className="absolute bottom-20 left-1/2 w-80 h-80 glass rounded-full animate-float"
            style={{ animationDelay: '4s' }}
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-in-left">
              <Image 
                src="/assets/logo-dark.png" 
                alt="Zariel Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-primary">
                Zariel
              </span>
            </div>
              <div className="flex items-center gap-4 animate-slide-in-right">
                <Link href="/auth/login">
                  <Button variant="ghost" size="lg" className="text-primary hover:bg-primary/10 transition-all hover:scale-105">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-white transition-all hover:scale-105 shadow-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-fade-in space-y-4">
              <div className="inline-block">
                <span className="px-6 py-3 glass-card text-accent rounded-full text-sm font-semibold border border-accent/30">
                  🚀 The Future of Content Commerce
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Empower Your
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Creative Journey
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Connect creators with brands through a revolutionary token-based marketplace. 
                Upload, trade, and monetize content seamlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass border-2 border-accent/30 hover:glass-card transition-all hover:scale-105 text-lg px-8 py-6 text-accent hover:text-accent">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose <span className="text-accent">Zariel</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in the creator economy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group glass-card hover:animate-glow border-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'slideUp 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary/70 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 glass py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built for <span className="text-accent">Success</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of creators already growing their business
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 glass-card rounded-lg hover:animate-glow transition-all hover:scale-105 cursor-pointer border border-primary/20"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInLeft 0.5s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <Card className="overflow-hidden glass-card border-primary/30">
          <CardContent className="p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join Zariel today and transform how you create, share, and monetize content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-10 py-6">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="glass border-2 border-accent/30 hover:glass-card transition-all hover:scale-105 text-lg px-10 py-6 text-accent hover:text-accent">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              {/* <Image 
                src="/assets/logo-light.png" 
                alt="Zariel Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain"
              /> */}
              <span className="text-lg font-semibold">Zariel </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Zariel. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms</a>
              <a href="#" className="hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
