import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { getDealershipAnalytics } from '@/lib/analytics';
import AnalyticsClient from './client';
import { ToastProvider } from '@/components/ui/use-toast';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | CarDealerAI',
  description: 'Track your dealership performance and customer engagement.',
};

export default async function AnalyticsPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null; // This should never happen because of our middleware
  }

  const dealershipId = session.user.user_metadata?.dealership_id as string;
  
  // Get initial analytics data with SSR
  let initialData;
  try {
    initialData = await getDealershipAnalytics(dealershipId);
  } catch (error) {
    console.error('Error fetching initial analytics data:', error);
    // We'll let the client component handle the null case
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <ToastProvider>
        <AnalyticsClient initialData={initialData} />
      </ToastProvider>
    </div>
  );
} 