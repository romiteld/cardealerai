import { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Subscription Success | CarDealerAI',
  description: 'Your subscription has been successfully activated',
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Subscription Activated!</h1>
          
          <p className="text-gray-600 mb-6">
            Your subscription has been successfully activated. You now have access to all the features included in your plan.
          </p>
          
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          
          <div className="mt-4">
            <Link 
              href="/dashboard/subscription" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Manage your subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 