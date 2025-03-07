import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import PricingTiers from '@/components/pricing/PricingTiers';

export const metadata: Metadata = {
  title: 'Subscription | CarDealerAI',
  description: 'Manage your CarDealerAI subscription',
};

export default async function SubscriptionPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect if not authenticated (should be handled by middleware)
  if (!session) {
    return null;
  }
  
  // Fetch user and dealership data
  const { data: userData } = await supabase
    .from('users')
    .select('*, dealerships(*)')
    .eq('id', session.user.id)
    .single();
  
  const dealership = userData?.dealerships;
  const subscriptionTier = dealership?.subscription_tier || null;
  const hasActiveSubscription = Boolean(dealership?.subscription_status === 'active');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-gray-500 mt-2">
          Choose the plan that fits your dealership's needs
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* Subscription status banner */}
        {hasActiveSubscription ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            <h2 className="font-semibold">You're subscribed to the {subscriptionTier ? subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1) : ''} plan</h2>
            <p>Your subscription is active and you have access to all features included in your plan.</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-6">
            <h2 className="font-semibold">Select a subscription plan to get started</h2>
            <p>Choose the plan that best suits your needs. You can upgrade or downgrade at any time.</p>
          </div>
        )}
        
        {/* Pricing tiers */}
        <PricingTiers 
          currentTier={subscriptionTier} 
          isSubscribed={hasActiveSubscription} 
        />
      </div>
      
      {/* FAQ section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Can I change my plan later?</h3>
            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be effective immediately.</p>
          </div>
          <div>
            <h3 className="font-semibold">How does billing work?</h3>
            <p className="text-gray-600">We bill monthly on the date you subscribed. You can cancel at any time.</p>
          </div>
          <div>
            <h3 className="font-semibold">What payment methods do you accept?</h3>
            <p className="text-gray-600">We accept all major credit cards via our secure payment processor, Stripe.</p>
          </div>
          <div>
            <h3 className="font-semibold">What happens if I exceed my plan's limits?</h3>
            <p className="text-gray-600">You'll be notified when you're approaching your plan limits and prompted to upgrade if needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 