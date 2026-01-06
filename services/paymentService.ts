
import { supabase } from '../lib/supabase';
import { getStripe } from '../lib/stripe';

/**
 * Initiates the checkout process by calling the backend to create a session
 * and then redirecting to Stripe.
 */
export const startSubscriptionCheckout = async (priceId: string = 'price_default') => {
    try {
        // 1. Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        // 2. Call Supabase Edge Function to create Checkout Session
        // Note: You must deploy the 'create-checkout-session' function to Supabase
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId,
                email: user.email,
                userId: user.id,
                returnUrl: window.location.origin // Dynamic return URL
            }
        });

        if (error) {
            console.error('Function error:', error);
            throw new Error('Failed to create checkout session. Please check backend configuration.');
        }

        if (!data?.sessionId) {
            throw new Error('No session ID returned from backend');
        }

        // 3. Redirect to Stripe Checkout
        const stripe = await getStripe();
        if (!stripe) throw new Error('Stripe failed to initialize. Check your Publishable Key.');

        const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });

        if (stripeError) throw stripeError;

    } catch (err: any) {
        console.error('Payment error:', err);
        throw err;
    }
};
