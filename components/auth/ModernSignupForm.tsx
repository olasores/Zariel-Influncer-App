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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type UserRole = 'creator' | 'innovator' | 'visionary';

export function ModernSignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
          is_admin: false,
          token_balance: 0,
        });

        if (profileError) throw profileError;

        const { error: walletError } = await supabase.from('token_wallets').insert({
          user_id: data.user.id,
          balance: 0,
        });

        if (walletError) throw walletError;

        // Add animation delay before redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const roleDescriptions = {
    creator: 'Upload and monetize your content',
    innovator: 'Discover and purchase creator content',
    visionary: 'Advanced features and exclusive access'
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 glass rounded-full animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 glass-dark rounded-full animate-float" style={{ animationDelay: '2s' }} />
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

        {/* Signup Card */}
        <Card className="glass-card border-primary/30 shadow-2xl animate-scale-in">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join the creator economy today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-slide-in-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-base font-medium">Account Type</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={loading}>
                    <SelectTrigger className="pl-10 h-12 text-base border-2 glass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creator">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Creator</span>
                          <span className="text-xs text-muted-foreground">Upload and sell content</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="innovator">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Innovator</span>
                          <span className="text-xs text-muted-foreground">Purchase and bid on content</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="visionary">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Visionary</span>
                          <span className="text-xs text-muted-foreground">Premium access and features</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  {roleDescriptions[role]}
                </p>
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
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-primary transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold glass-card hover:animate-glow border-primary/30 transition-all hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Sign in
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
