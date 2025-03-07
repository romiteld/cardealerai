import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import MarketResearch from '@/components/MarketResearch';

export const metadata: Metadata = {
  title: 'Market Research | CarDealerAI',
  description: 'Research vehicle prices and market trends with real data.',
};

export default async function MarketResearchPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null; // This should never happen because of our middleware
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market Research</h1>
      </div>
      <div className="grid gap-8">
        <MarketResearch />
      </div>
    </div>
  );
} 