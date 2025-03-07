'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

interface PricingTiersProps {
  currentTier?: string | null;
  isSubscribed?: boolean;
}

export default function PricingTiers({ currentTier, isSubscribed = false }: PricingTiersProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubscribe = async (planId: string) => {
    if (loading) return;
    
    setLoading(planId);
    setError(null);
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionTier: planId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(null);
    }
  };
  
  const handleManageSubscription = async () => {
    setLoading('manage');
    setError(null);
    
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to access billing portal');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe billing portal
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(null);
    }
  };
  
  const getActionButton = (planId: string) => {
    const isCurrentPlan = currentTier === planId;
    
    if (isCurrentPlan && isSubscribed) {
      return (
        <Button
          onClick={handleManageSubscription}
          disabled={loading === 'manage'}
          variant="outline"
          className="w-full mt-6"
        >
          {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
        </Button>
      );
    }
    
    return (
      <Button
        onClick={() => handleSubscribe(planId)}
        disabled={loading === planId}
        className="w-full mt-6"
        variant={isCurrentPlan ? 'outline' : 'default'}
      >
        {loading === planId ? 'Loading...' : isCurrentPlan ? 'Current Plan' : 'Subscribe'}
      </Button>
    );
  };
  
  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => (
          <div 
            key={id}
            className={`rounded-xl overflow-hidden border ${
              currentTier === id 
                ? 'border-blue-500 shadow-lg shadow-blue-100' 
                : 'border-gray-200'
            }`}
          >
            {currentTier === id && (
              <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                Current Plan
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-gray-500 mt-2">{plan.description}</p>
              
              <div className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              {getActionButton(id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 