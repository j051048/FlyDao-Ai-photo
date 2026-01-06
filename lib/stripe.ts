
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  // Try to get key from env vars (Vite/Next pattern) or window.process shim
  const key = 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
    (window as any).process?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePromise && key) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
