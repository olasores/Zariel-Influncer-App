'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, DollarSign, Calendar } from 'lucide-react';
import { ServiceUploadDialog } from './ServiceUploadDialog';
import { ServiceBookingDialog } from './ServiceBookingDialog';

interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price_type: string;
  price_amount: number;
  location: string;
  availability: string;
  image_url: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const categoryLabels: Record<string, string> = {
  studio_rental: 'Studio Rental',
  photographer: 'Photographer',
  talent: 'Talent',
  service_provider: 'Service Provider',
  production: 'Production',
  actor_model: 'Actor/Model',
  singer: 'Singer',
  other: 'Other Services',
};

export function ServicesMarketplace() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchQuery.trim()) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryLabels[s.category]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };
  const getPriceDisplay = (service: Service) => {
    if (service.price_type === 'negotiable') return 'Negotiable';
    if (!service.price_amount) return 'Contact for price';
    
    const amount = `${service.price_amount} ZARYO`;
    switch (service.price_type) {
      case 'hourly': return `${amount}/hr`;
      case 'daily': return `${amount}/day`;
      case 'fixed': return amount;
      default: return amount;
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Services Marketplace</h2>
          <p className="text-muted-foreground mt-1">
            Discover and book professional services
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Post Service
        </Button>
      </div>

      <Card className="hover-card glass-card border-none">
        <CardHeader>
          <CardTitle>Search Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services by title, description, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <Card className="glass-card border-none">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No services found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover-card glass-card border-none">
              {service.image_url && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {service.profiles.full_name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10">
                    {categoryLabels[service.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {service.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {service.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm font-semibold text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {getPriceDisplay(service)}
                  </div>

                  {service.availability && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {service.availability}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleBookService(service)}
                  disabled={service.user_id === profile?.id}
                >
                  {service.user_id === profile?.id ? 'Your Service' : 'Book Service'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={loadServices}
      />

      {selectedService && (
        <ServiceBookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          service={selectedService}
          onSuccess={() => {
            setBookingDialogOpen(false);
            loadServices();
          }}
        />
      )}
    </div>
  );
}
