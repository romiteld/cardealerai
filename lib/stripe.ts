import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Map our subscription tiers to Stripe price IDs
export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    description: 'For single dealerships with basic needs',
    priceId: 'price_pro', // Replace with actual Stripe price ID
    features: [
      'Up to 100 vehicle listings',
      'Basic AI image enhancement',
      'Single social media platform',
      '5 users maximum',
      'Email support',
    ],
    limits: {
      listings: 100,
      users: 5,
      socialPlatforms: 1,
    },
  },
  growth: {
    name: 'Growth',
    description: 'For growing dealerships with advanced needs',
    priceId: 'price_growth', // Replace with actual Stripe price ID
    features: [
      'Up to 500 vehicle listings',
      'Advanced AI image enhancements',
      'All social media platforms',
      '20 users maximum',
      'Email and chat support',
      'Analytics dashboard',
    ],
    limits: {
      listings: 500,
      users: 20,
      socialPlatforms: 3,
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For auto groups with multiple dealerships',
    priceId: 'price_enterprise', // Replace with actual Stripe price ID
    features: [
      'Unlimited vehicle listings',
      'All AI features',
      'All social media platforms',
      'Unlimited users',
      'Priority support with dedicated account manager',
      'Advanced analytics and reporting',
    ],
    limits: {
      listings: Infinity,
      users: Infinity,
      socialPlatforms: Infinity,
    },
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;

// Create a checkout session for subscription
export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  dealershipId,
  email,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId?: string;
  userId: string;
  dealershipId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: !customerId ? email : undefined,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      dealershipId,
    },
  });
}

// Create a portal session for managing subscriptions
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Retrieve a subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// List all subscriptions for a customer
export async function listSubscriptions(customerId: string) {
  return await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export default stripe; 