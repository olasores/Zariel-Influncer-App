'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, DollarSign, Clock, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price_type: string;
  price_amount: number;
  location: string;
  status: string;
}

interface Booking {
  id: string;
  service_id: string;
  user_id: string;
  booking_date: string;
  duration: string;
  message: string;
  status: string;
  created_at: string;
  services: Service;
  profiles: {
    full_name: string;
    email: string;
  };
}

export function MyServicesManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadBookings();
      subscribeToBookings();
    }
  }, [profile]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          services (
            id,
            title,
            description,
            category,
            price_type,
            price_amount,
            location,
            status
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('service_owner_id', profile?.id)
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
      .channel('service_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bookings',
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

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Booking ${newStatus}`,
      });

      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking',
        variant: 'destructive',
      });
    }
  };

  const filterBookingsByStatus = (status: string) => {
    if (status === 'confirmed') {
      // Show both confirmed and paid bookings in confirmed tab
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
                {booking.profiles.full_name}
              </span>
              <span className="text-sm text-muted-foreground">
                ({booking.profiles.email})
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
          {booking.services.price_amount && (
            <div className="flex items-center text-sm font-semibold text-green-600">
              <DollarSign className="h-4 w-4 mr-1" />
              {booking.services.price_amount} ZARYO
            </div>
          )}
        </div>

        {booking.message && (
          <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{booking.message}</p>
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              className="flex-1"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-red-400"
            >
              Decline
            </Button>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600">
              ⏳ Waiting for customer to complete payment
            </p>
          </div>
        )}

        {booking.status === 'paid' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateBookingStatus(booking.id, 'completed')}
            className="w-full bg-white/5 border-white/10 hover:bg-white/10"
          >
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  const pendingBookings = filterBookingsByStatus('pending');
  const confirmedBookings = filterBookingsByStatus('confirmed');
  const completedBookings = filterBookingsByStatus('completed');
  const cancelledBookings = filterBookingsByStatus('cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Booking Requests</h2>
        <p className="text-muted-foreground mt-1">Manage booking requests for your services</p>
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
