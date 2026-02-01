'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Shield, User, Building2, Coins, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_admin: boolean;
  created_at: string;
  wallet?: {
    balance: number;
    total_earned: number;
    total_spent: number;
  };
  subscription?: {
    status: string;
    current_period_end: string;
  };
  content_count?: number;
  purchase_count?: number;
}

export function AdminUserManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [resetAmount, setResetAmount] = useState('0');
  const [resetNotes, setResetNotes] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Use API route with service role to get all users
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersWithData = await response.json();
      setUsers(usersWithData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetBalance = async () => {
    if (!selectedUser) return;

    setResetLoading(true);
    try {
      const newBalance = parseInt(resetAmount);
      if (isNaN(newBalance) || newBalance < 0) {
        throw new Error('Invalid balance amount');
      }

      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }
      
      if (!sessionData?.session?.access_token) {
        console.error('No access token found');
        throw new Error('Not authenticated');
      }

      console.log('Making API request with token:', sessionData.session.access_token.substring(0, 20) + '...');

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newBalance,
          notes: resetNotes,
        }),
      });

      const responseData = await response.json();
      console.log('API response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to reset balance');
      }

      toast({
        title: 'Success',
        description: 'User balance updated successfully',
      });

      setSelectedUser(null);
      setResetAmount('0');
      setResetNotes('');
      loadUsers();
    } catch (error: any) {
      console.error('Error resetting balance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset balance',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string, isAdmin: boolean) => {
    if (isAdmin) return <Shield className="h-4 w-4" />;
    if (role === 'creator') return <User className="h-4 w-4" />;
    return <Building2 className="h-4 w-4" />;
  };

  const getRoleBadge = (role: string, isAdmin: boolean) => {
    if (isAdmin) return <Badge className="bg-blue-600">Admin</Badge>;
    if (role === 'creator') return <Badge variant="secondary">Creator</Badge>;
    if (role === 'innovator') return <Badge variant="outline">Innovator</Badge>;
    if (role === 'visionary') return <Badge variant="outline">Visionary</Badge>;
    return <Badge variant="outline">User</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Creators</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'creator').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'innovator' || u.role === 'visionary').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_admin).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email, name, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Token Balance</TableHead>
                  <TableHead>Earned/Spent</TableHead>
                  <TableHead>Content/Purchases</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-gray-50">
                          {getRoleIcon(user.role, user.is_admin)}
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role, user.is_admin)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        {user.wallet?.balance.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">
                          +{user.wallet?.total_earned.toLocaleString() || 0}
                        </div>
                        <div className="text-red-600">
                          -{user.wallet?.total_spent.toLocaleString() || 0}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.content_count} content</div>
                        <div>{user.purchase_count} purchases</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <Badge
                          variant={user.subscription.status === 'active' ? 'default' : 'secondary'}
                        >
                          {user.subscription.status}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your search
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Balance Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Balance</DialogTitle>
            <DialogDescription>
              Reset token balance for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <div className="text-2xl font-bold text-yellow-600 flex items-center gap-2 mt-1">
                <Coins className="h-6 w-6" />
                {selectedUser?.wallet?.balance.toLocaleString() || 0} Zaryo
              </div>
            </div>

            <div>
              <Label htmlFor="reset-amount">New Balance</Label>
              <Input
                id="reset-amount"
                type="number"
                min="0"
                value={resetAmount}
                onChange={(e) => setResetAmount(e.target.value)}
                placeholder="Enter new balance"
              />
            </div>

            <div>
              <Label htmlFor="reset-notes">Notes (Required)</Label>
              <Textarea
                id="reset-notes"
                value={resetNotes}
                onChange={(e) => setResetNotes(e.target.value)}
                placeholder="Reason for balance reset (e.g., Token redemption completed)"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetBalance}
                disabled={resetLoading || !resetNotes.trim()}
              >
                {resetLoading ? 'Updating...' : 'Reset Balance'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
