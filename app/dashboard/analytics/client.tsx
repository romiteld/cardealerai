'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { ActivityPeriod, AnalyticsData } from '@/lib/analytics';

interface AnalyticsClientProps {
  initialData?: AnalyticsData;
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ActivityPeriod>('month');
  const { toast } = useToast();
  
  // Fetch analytics data when period changes
  const fetchAnalyticsData = async (period: ActivityPeriod) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }
      
      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error fetching data',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle period change from the dashboard
  const handlePeriodChange = (period: ActivityPeriod) => {
    setSelectedPeriod(period);
    fetchAnalyticsData(period);
  };
  
  // Fetch data on initial mount if no initial data was provided
  useEffect(() => {
    if (!initialData) {
      fetchAnalyticsData(selectedPeriod);
    }
  }, [initialData]);
  
  return (
    <AnalyticsDashboard
      analyticsData={analyticsData}
      isLoading={isLoading}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
    />
  );
} 