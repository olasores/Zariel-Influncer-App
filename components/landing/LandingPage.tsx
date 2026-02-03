'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
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

interface RevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'animate-fade-in' | 'animate-slide-up' | 'animate-slide-in-left' | 'animate-slide-in-right' | 'animate-scale-in';
  delay?: number;
  threshold?: number;
}

function Reveal({ 
  children, 
  className = "", 
  animation = "animate-slide-up", 
  delay = 0,
  threshold = 0.1 
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return (
    <div 
      ref={ref} 
      className={`${className} ${isVisible ? animation : "opacity-0"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

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
        <nav className="relative z-10 w-full">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 md:space-x-4 animate-slide-in-left flex-shrink-0">
                {/* <Image 
                  src="/assets/logo-dark1.png" 
                  alt="Zariel Logo" 
                  width={80} 
                  height={80} 
                  className="w-12 h-12 md:w-20 md:h-20 object-contain logo-transparent"
                /> */}
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl md:text-4xl font-bold text-primary leading-none whitespace-nowrap">
                    Zariel & Co
                  </span>
                  <span className="text-xs md:text-base text-muted-foreground leading-none hidden sm:inline-block mt-1 md:mt-0">
                    Influencer Marketplace
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-6 animate-slide-in-right flex-shrink-0">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-primary hover:bg-primary/10 transition-all hover:scale-105 text-sm md:text-lg px-2 sm:px-3 py-2 md:px-6 md:py-3 h-auto">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-accent hover:bg-accent/90 text-white transition-all hover:scale-105 shadow-lg text-sm md:text-lg px-3 sm:px-4 py-2 md:px-6 md:py-3 h-auto whitespace-nowrap">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="inline sm:hidden">Join</span>
                    <ArrowRight className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="animate-fade-in space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 md:px-6 md:py-3 glass-card text-accent rounded-full text-xs md:text-sm font-semibold border border-accent/30">
                  🚀 The Future of Content Commerce
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight px-2">
                Empower Your
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mt-2">
                  Creative Journey
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
                Connect creators with brands through a revolutionary token-based marketplace. 
                Upload, trade, and monetize content seamlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 animate-slide-up w-full sm:w-auto">
              <Link href="/auth/signup">
                <Button className="w-auto min-w-[200px] bg-accent hover:bg-accent/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-base md:text-lg px-8 py-6 h-auto rounded-xl">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="w-auto min-w-[200px] glass border-2 border-accent/30 hover:glass-card transition-all hover:scale-105 text-base md:text-lg px-8 py-6 h-auto text-accent hover:text-accent rounded-xl">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <Reveal className="text-center mb-10 md:mb-16 space-y-4" animation="animate-slide-up">
          <h2 className="text-3xl md:text-5xl font-bold">
            Why Choose <span className="text-accent">Zariel</span>?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in the creator economy
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Reveal key={index} delay={index * 0.1} animation="animate-slide-up">
              <Card className="group hover-card glass-card border-none cursor-pointer h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary/70 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 glass py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <Reveal className="text-center mb-8 md:mb-12" animation="animate-slide-up">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Built for <span className="text-accent">Success</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Join thousands of creators already growing their business
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {benefits.map((benefit, index) => (
                <Reveal key={index} delay={index * 0.1} animation="animate-slide-in-left">
                  <div className="flex items-center gap-3 p-4 hover-card glass-card border-none rounded-lg cursor-pointer h-full">
                    <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <Reveal animation="animate-scale-in">
          <Card className="overflow-hidden glass-card border-primary/30">
            <CardContent className="p-8 md:p-16 text-center space-y-6 md:space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Ready to Start?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join the revolution and turn your creativity into profit
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-base md:text-lg px-8 py-6 h-auto">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto glass border-2 border-accent/30 hover:glass-card transition-all hover:scale-105 text-base md:text-lg px-8 py-6 h-auto text-accent hover:text-accent">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 md:py-12 bg-black/20 md:bg-transparent">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-center md:text-left">
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* <Image 
                src="/assets/logo-dark1.png" 
                alt="Zariel Logo" 
                width={64} 
                height={64} 
                className="w-12 h-12 md:w-16 md:h-16 object-contain logo-transparent"
              /> */}
              <div className="flex flex-col items-center md:items-start">
                <span className="text-xl md:text-2xl font-bold text-primary leading-none">Zariel & Co</span>
                <span className="text-xs md:text-base text-muted-foreground leading-none mt-1 md:mt-0">Influencer Marketplace</span>
              </div>
            </div>
            <p className="text-sm md:text-lg text-muted-foreground order-3 md:order-2">
              © 2026 Zariel & Co.
            </p>
            <div className="flex gap-6 md:gap-8 text-sm md:text-lg text-muted-foreground order-2 md:order-3">
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