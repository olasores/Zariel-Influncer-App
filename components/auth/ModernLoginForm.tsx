'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ModernLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Add a slight delay for animation effect
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 glass rounded-full animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 glass-dark rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center justify-center space-x-4 mb-8 animate-fade-in cursor-pointer group">
            {/* <Image 
              src="/assets/logo-dark1.png" 
              alt="Zariel Logo" 
              width={72} 
              height={72} 
              className="w-18 h-18 object-contain group-hover:scale-110 transition-transform logo-transparent"
            /> */}
            <div className="flex flex-col">
              <span className="text-3xl md:text-4xl font-bold text-secondary leading-none">
                Zariel & Co
              </span>
              <span className="text-base md:text-lg text-muted-foreground leading-none">
                Influencer Marketplace
              </span>
            </div>
          </div>
        </Link>

        {/* Login Card */}
        <Card className="glass-card border-primary/30 shadow-2xl animate-scale-in">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to continue your creative journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-slide-in-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all glass"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all glass"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-2" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

                <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold glass-card hover:animate-glow border-primary/30 transition-all hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline font-semibold">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6 animate-fade-in">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
