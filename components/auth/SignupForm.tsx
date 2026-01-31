'use client';

import { useState } from 'react';
import { supabase, UserRole } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';

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
      // Check if email is admin domain
      const isAdminUser = isAdminEmail(email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            is_admin: isAdminUser,
          },
        },
      });

      if (authError) throw authError;

      // Check if user already exists (Supabase returns identities as empty array)
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        setError('An account with this email already exists. Please try logging in instead.');
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Check if user needs email confirmation
        if (authData.session === null) {
          setError('Account created! Please check your email to confirm your account before logging in.');
          setLoading(false);
          return;
        }

        // Profile will be created automatically by the database trigger
        // which reads from raw_user_meta_data
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('already registered')) {
        setError('This email was recently used. Please wait 60 seconds and try again, or use a different email.');
      } else if (err.message?.includes('rate limit')) {
        setError('Too many signup attempts. Please wait a minute and try again.');
      } else {
        setError(err.message || 'Failed to sign up');
      }
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
            {isAdminEmail(email) && email.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                <Shield className="h-3 w-3" />
                <span>This email will have admin access</span>
              </div>
            )}
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
                    Tier 1 - Upload and sell content
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="innovator" id="innovator" />
                <Label htmlFor="innovator" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Innovator</div>
                  <div className="text-sm text-muted-foreground">
                    Tier 2 - Browse and purchase content
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <RadioGroupItem value="visionary" id="visionary" />
                <Label htmlFor="visionary" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Visionary</div>
                  <div className="text-sm text-muted-foreground">
                    Tier 3 - Advanced features and priority access
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border border-blue-300 bg-blue-50 p-4">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="flex-1 cursor-pointer">
                  <div className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Admin
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Platform management and oversight (FTE users only)
                  </div>
                </Label>
              </div>
            </RadioGroup>
            {isAdminEmail(email) && email.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                <Shield className="h-3 w-3" />
                <span>✓ Admin privileges will be granted with this email</span>
              </div>
            )}
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
