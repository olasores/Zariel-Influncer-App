'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, User, MessageSquare, Coins, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Booking {
  id: string;
  service_id: string;
  booking_date: string;
  duration: string;
  message: string;
  status: string;
  tokens_paid: number;
  created_at: string;
  services: Service;
}

export function MyBookingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  // Debug: Log profile when it changes
  useEffect(() => {
    console.log('MyBookingsPage Profile:', profile);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadBookings();
      const unsubscribe = subscribeToBookings();
      return unsubscribe;
    }
  }, [profile]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          services!inner (
            id,
            title,
            description,
            category,
            location,
            profiles:user_id (
              full_name,
              email
            )
          )
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel('my_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bookings',
          filter: `user_id=eq.${profile?.id}`,
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePayment = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    console.log('Payment Debug:', {
      bookingId,
      requiredAmount: booking?.tokens_paid,
      profileBalance: profile?.token_balance,
      fullProfile: profile
    });
    
    // Check balance before attempting payment
    if (booking && (profile?.token_balance || 0) < booking.tokens_paid) {
      toast({
        title: 'Insufficient Tokens',
        description: `You need ${booking.tokens_paid} ZARYO tokens but only have ${profile?.token_balance || 0}. Please purchase more tokens.`,
        variant: 'destructive',
      });
      return;
    }

    setPayingBookingId(bookingId);
    try {
      const { data, error } = await supabase.rpc('pay_for_booking', {
        p_booking_id: bookingId,
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      toast({
        title: 'Payment Successful!',
        description: `${data.tokens_paid} ZARYO tokens transferred to service provider`,
      });

      // Refresh profile to update token balance
      await refreshProfile();
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPayingBookingId(null);
    }
  };

  const filterBookingsByStatus = (status: string) => {
    if (status === 'confirmed') {
      // Show both confirmed (awaiting payment) and paid bookings in confirmed tab
      return bookings.filter((b) => b.status === 'confirmed' || b.status === 'paid');
    }
    return bookings.filter((b) => b.status === status);
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="mb-4 hover-card glass-card border-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.services.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Provider: {booking.services.profiles.full_name}
              </span>
            </div>
          </div>
          <Badge
            variant={
              booking.status === 'paid' || booking.status === 'confirmed'
                ? 'default'
                : booking.status === 'pending'
                ? 'secondary'
                : booking.status === 'cancelled'
                ? 'destructive'
                : 'outline'
            }
          >
            {booking.status === 'paid' ? 'Paid' : booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            {new Date(booking.booking_date).toLocaleString()}
          </div>
          {booking.duration && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              {booking.duration}
            </div>
          )}
          {booking.services.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {booking.services.location}
            </div>
          )}
          {booking.tokens_paid > 0 && (
            <div className="flex items-center text-sm font-semibold text-green-600">
              <Coins className="h-4 w-4 mr-1" />
              {booking.tokens_paid} ZARYO Paid
            </div>
          )}
        </div>

        {booking.message && (
          <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{booking.message}</p>
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600">
              ⏳ Waiting for service provider to review your request
            </p>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 font-semibold">
                ✓ Booking confirmed by provider!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Complete payment to finalize your booking
              </p>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-blue-600">Payment Required: {booking.tokens_paid} ZARYO</p>
                <p className="text-sm text-muted-foreground">
                  Your balance: {profile?.token_balance || 0} ZARYO
                </p>
              </div>
              <Button 
                onClick={() => handlePayment(booking.id)}
                disabled={payingBookingId === booking.id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {payingBookingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay {booking.tokens_paid} ZARYO
              </Button>
            </div>
          </div>
        )}

        {booking.status === 'paid' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 font-semibold">
              ✓ Payment completed! Booking confirmed
            </p>
            <p className="text-sm text-green-600 mt-1">
              Contact: {booking.services.profiles.email}
            </p>
          </div>
        )}

        {booking.status === 'cancelled' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600">
              This booking was cancelled
            </p>
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-600">
              Service completed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading your bookings...</div>;
  }

  const pendingBookings = filterBookingsByStatus('pending');
  const confirmedBookings = filterBookingsByStatus('confirmed');
  const completedBookings = filterBookingsByStatus('completed');
  const cancelledBookings = filterBookingsByStatus('cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Bookings</h2>
        <p className="text-muted-foreground mt-1">Track your service booking requests</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="flex flex-col h-auto sm:grid sm:h-10 sm:grid-cols-4 bg-transparent sm:bg-white/5 border-none sm:border sm:border-white/10 gap-2 sm:gap-0 p-0 sm:p-1">
          <TabsTrigger value="pending" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border sm:border-none border-white/10 bg-white/5 sm:bg-transparent">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border sm:border-none border-white/10 bg-white/5 sm:bg-transparent">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border sm:border-none border-white/10 bg-white/5 sm:bg-transparent">
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border sm:border-none border-white/10 bg-white/5 sm:bg-transparent">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pending bookings</p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No confirmed bookings</p>
              </CardContent>
            </Card>
          ) : (
            confirmedBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedBookings.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No completed bookings</p>
              </CardContent>
            </Card>
          ) : (
            completedBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length === 0 ? (
            <Card className="glass-card border-none">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cancelled bookings</p>
              </CardContent>
            </Card>
          ) : (
            cancelledBookings.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
