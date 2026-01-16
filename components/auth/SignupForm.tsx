'use client';

import { useState } from 'react';
import { supabase, UserRole } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
        });

        if (profileError) throw profileError;

        const { error: walletError } = await supabase.from('token_wallets').insert({
          user_id: authData.user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        });

        if (walletError) throw walletError;

        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join ZARIEL & Co Influencer Platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="creator" id="creator" />
                <Label htmlFor="creator" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Creator</div>
                  <div className="text-sm text-muted-foreground">
                    Upload content ideas and earn tokens
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Company</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and purchase content concepts
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="p-0"
              onClick={onSwitchToLogin}
            >
              Log In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
