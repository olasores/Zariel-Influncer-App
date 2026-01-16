export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TnVSr2jzOZAzHi',
    priceId: 'price_1SpuRzElNJegsmPmDjI2JnYv',
    name: 'Zariel & Co Monthly Membership',
    description: 'Monthly membership for Zariel & Co influencer App',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription',
  },
  {
    id: 'zaryo_100',
    priceId: 'price_zaryo_100',
    name: '100 Zaryo',
    description: 'Purchase 100 Zaryo tokens',
    price: 10.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_500',
    priceId: 'price_zaryo_500',
    name: '500 Zaryo',
    description: 'Purchase 500 Zaryo tokens',
    price: 50.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_1000',
    priceId: 'price_zaryo_1000',
    name: '1000 Zaryo',
    description: 'Purchase 1000 Zaryo tokens',
    price: 100.00,
    currency: 'USD',
    mode: 'payment',
  },
  {
    id: 'zaryo_5000',
    priceId: 'price_zaryo_5000',
    name: '5000 Zaryo',
    description: 'Purchase 5000 Zaryo tokens',
    price: 500.00,
    currency: 'USD',
    mode: 'payment',
  },
];
