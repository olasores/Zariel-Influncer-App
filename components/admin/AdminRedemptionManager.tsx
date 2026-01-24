'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Coins, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RedemptionRequest {
  id: string;
  user_id: string;
  name: string;
  token_count: number;
  payment_method: string;
  account_username: string | null;
  phone_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_email?: string;
}

export function AdminRedemptionManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const { data: requestsData, error } = await supabase
        .from('redemption_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails
      const requestsWithEmails = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            user_email: userData?.email || 'Unknown',
          };
        })
      );

      setRequests(requestsWithEmails);
    } catch (error) {
      console.error('Error loading redemption requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load redemption requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !profile) return;

    setActionLoading(true);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('redemption_requests')
        .update({
          status: 'approved',
          notes: actionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Redemption request approved',
      });

      setSelectedRequest(null);
      setActionNotes('');
      loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest || !profile) return;

    setActionLoading(true);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('redemption_requests')
        .update({
          status: 'completed',
          notes: actionNotes,
          completed_at: new Date().toISOString(),
          completed_by: profile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Deduct tokens from user's wallet
      const { data: wallet } = await supabase
        .from('token_wallets')
        .select('balance')
        .eq('user_id', selectedRequest.user_id)
        .single();

      if (wallet) {
        const newBalance = Math.max(0, wallet.balance - selectedRequest.token_count);
        
        await supabase
          .from('token_wallets')
          .update({ balance: newBalance })
          .eq('user_id', selectedRequest.user_id);

        // Create transaction record
        await supabase.from('token_transactions').insert({
          from_user_id: selectedRequest.user_id,
          amount: -selectedRequest.token_count,
          transaction_type: 'redemption',
          description: `Token redemption completed: ${selectedRequest.payment_method}`,
          status: 'completed',
        });
      }

      toast({
        title: 'Success',
        description: 'Redemption completed and tokens deducted',
      });

      setSelectedRequest(null);
      setActionNotes('');
      loadRequests();
    } catch (error: any) {
      console.error('Error completing request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !profile) return;

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('redemption_requests')
        .update({
          status: 'rejected',
          notes: actionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Redemption request rejected',
      });

      setSelectedRequest(null);
      setActionNotes('');
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading redemption requests...</div>;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Token Redemption Requests</h2>
        <p className="text-gray-600 mt-1">
          Manage user token redemption requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Coins className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>Review and process redemption requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Token Count</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {request.name}
                        </div>
                        <div className="text-sm text-gray-500">{request.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-yellow-600">
                        <Coins className="h-4 w-4" />
                        {request.token_count.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.payment_method}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No redemption requests yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Redemption Request</DialogTitle>
            <DialogDescription>
              Process redemption request for {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User</Label>
                <div className="text-sm font-medium">{selectedRequest?.name}</div>
                <div className="text-xs text-gray-500">{selectedRequest?.user_email}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{selectedRequest && getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Token Count</Label>
                <div className="text-lg font-bold text-yellow-600 flex items-center gap-2 mt-1">
                  <Coins className="h-5 w-5" />
                  {selectedRequest?.token_count.toLocaleString()} Zaryo
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <div className="mt-1">
                  <Badge variant="outline">{selectedRequest?.payment_method}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Account Username/Email</Label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1">
                  {selectedRequest?.account_username || 'Not provided'}
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1">
                  {selectedRequest?.phone_number || 'Not provided'}
                </div>
              </div>
            </div>

            {selectedRequest?.notes && (
              <div>
                <Label>Previous Notes</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                  {selectedRequest.notes}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="action-notes">Notes</Label>
              <Textarea
                id="action-notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add notes about this action..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                </>
              )}
              {selectedRequest?.status === 'approved' && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleComplete}
                  disabled={actionLoading}
                >
                  Mark Complete & Deduct Tokens
                </Button>
              )}
              {(selectedRequest?.status === 'completed' || selectedRequest?.status === 'rejected') && (
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
