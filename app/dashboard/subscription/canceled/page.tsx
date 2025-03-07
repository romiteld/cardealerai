import { Metadata } from 'next';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Subscription Canceled | CarDealerAI',
  description: 'Your subscription checkout was canceled',
};

export default function SubscriptionCanceledPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-6">
            <X className="h-8 w-8 text-gray-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Checkout Canceled</h1>
          
          <p className="text-gray-600 mb-6">
            Your subscription checkout was canceled and no charges were made. You can try again when you're ready.
          </p>
          
          <div className="space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/subscription">Try Again</Link>
            </Button>
            
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Need help? Contact our support team at <a href="mailto:support@cardealerai.com" className="text-blue-600 hover:text-blue-500">support@cardealerai.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
} 