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
    id: 'prod_UHMzXBbwjWu8M1',
    priceId: 'price_1TIoFdKCoozoStdMaAuFGXgP',
    name: 'Paying to Win - Premium Tier',
    description: 'Triple all agent stats. Top hat, monocle, and fake mustache included.',
    price: 9.99,
    currency: 'USD',
    mode: 'subscription'
  }
];

export const getPremiumProduct = () => STRIPE_PRODUCTS[0];