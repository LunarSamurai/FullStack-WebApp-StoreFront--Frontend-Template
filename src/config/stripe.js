// Stripe Configuration
// IMPORTANT: Replace with your actual Stripe publishable key
// Get this from: Stripe Dashboard > Developers > API keys

import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_KEY';

// Initialize Stripe - lazy loaded for performance
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Stripe checkout session configuration
export const createCheckoutConfig = (items, successUrl, cancelUrl) => ({
  line_items: items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description,
        images: item.imageUrl ? [item.imageUrl] : [],
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  })),
  mode: 'payment',
  success_url: successUrl,
  cancel_url: cancelUrl,
  billing_address_collection: 'required',
  shipping_address_collection: {
    allowed_countries: ['US', 'CA', 'GB', 'AU'],
  },
});

export default getStripe;
