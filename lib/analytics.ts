/**
 * Analytics utility for tracking user activity and performance
 */

import { createServerClient } from '@/lib/supabase';

export type ActivityPeriod = 'day' | 'week' | 'month' | 'year';

export type AnalyticsMetric = {
  label: string;
  value: number;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
};

export type ActivityBreakdown = {
  label: string;
  value: number;
  percentage: number;
};

export type AnalyticsData = {
  totalVehicles: AnalyticsMetric;
  activeListings: AnalyticsMetric;
  totalViews: AnalyticsMetric;
  leadConversion: AnalyticsMetric;
  socialEngagement: AnalyticsMetric;
  searchImpressions: AnalyticsMetric;
  vehicleTypeBreakdown: ActivityBreakdown[];
  priceRangeBreakdown: ActivityBreakdown[];
  viewsByDay: { date: string; views: number }[];
  inquiriesByDay: { date: string; inquiries: number }[];
  topPerformingListings: {
    id: string;
    title: string;
    views: number;
    inquiries: number;
    engagementRate: number;
  }[];
  marketResearchQueries: number;
  contentGenerations: number;
};

/**
 * Get analytics data for a dealership
 */
export async function getDealershipAnalytics(
  dealershipId: string,
  period: ActivityPeriod = 'month'
): Promise<AnalyticsData> {
  const supabase = createServerClient();
  
  // Get date range based on period
  const now = new Date();
  const startDate = new Date();
  if (period === 'day') {
    startDate.setDate(now.getDate() - 1);
  } else if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(now.getFullYear() - 1);
  }
  
  // Get comparison date range
  const comparisonStartDate = new Date(startDate);
  const comparisonEndDate = new Date(now);
  if (period === 'day') {
    comparisonStartDate.setDate(comparisonStartDate.getDate() - 1);
    comparisonEndDate.setDate(comparisonEndDate.getDate() - 1);
  } else if (period === 'week') {
    comparisonStartDate.setDate(comparisonStartDate.getDate() - 7);
    comparisonEndDate.setDate(comparisonEndDate.getDate() - 7);
  } else if (period === 'month') {
    comparisonStartDate.setMonth(comparisonStartDate.getMonth() - 1);
    comparisonEndDate.setMonth(comparisonEndDate.getMonth() - 1);
  } else if (period === 'year') {
    comparisonStartDate.setFullYear(comparisonStartDate.getFullYear() - 1);
    comparisonEndDate.setFullYear(comparisonEndDate.getFullYear() - 1);
  }
  
  // Format dates for queries
  const startDateStr = startDate.toISOString();
  const nowStr = now.toISOString();
  const comparisonStartDateStr = comparisonStartDate.toISOString();
  const comparisonEndDateStr = comparisonEndDate.toISOString();
  
  // Get total vehicles count
  const { count: totalVehicles } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId);
  
  // Get active listings count
  const { count: activeListings } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId)
    .eq('status', 'active');
  
  // Get previous period active listings for comparison
  const { count: previousActiveListings } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId)
    .eq('status', 'active')
    .lt('created_at', startDateStr);
  
  // Get total views for current period
  const { data: viewsData } = await supabase
    .from('vehicle_views')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('viewed_at', startDateStr)
    .lte('viewed_at', nowStr);
  
  const totalViews = viewsData?.length || 0;
  
  // Get total views for previous period
  const { data: previousViewsData } = await supabase
    .from('vehicle_views')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('viewed_at', comparisonStartDateStr)
    .lte('viewed_at', comparisonEndDateStr);
  
  const previousTotalViews = previousViewsData?.length || 0;
  
  // Calculate view change percentage
  const viewChange = previousTotalViews > 0 
    ? ((totalViews - previousTotalViews) / previousTotalViews) * 100 
    : 0;
  
  // Get leads for current period
  const { data: leadsData } = await supabase
    .from('leads')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', startDateStr)
    .lte('created_at', nowStr);
  
  const totalLeads = leadsData?.length || 0;
  
  // Get leads for previous period
  const { data: previousLeadsData } = await supabase
    .from('leads')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', comparisonStartDateStr)
    .lte('created_at', comparisonEndDateStr);
  
  const previousTotalLeads = previousLeadsData?.length || 0;
  
  // Calculate lead conversion rate
  const leadConversion = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;
  const previousLeadConversion = previousTotalViews > 0 
    ? (previousTotalLeads / previousTotalViews) * 100 
    : 0;
  
  const leadConversionChange = previousLeadConversion > 0 
    ? ((leadConversion - previousLeadConversion) / previousLeadConversion) * 100 
    : 0;
  
  // Get social engagement data
  const { data: socialData } = await supabase
    .from('social_engagement')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', startDateStr)
    .lte('created_at', nowStr);
  
  const totalSocialEngagement = socialData?.reduce((sum, item) => {
    return sum + (item.likes || 0) + (item.shares || 0) + (item.comments || 0);
  }, 0) || 0;
  
  // Get previous social engagement data
  const { data: previousSocialData } = await supabase
    .from('social_engagement')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', comparisonStartDateStr)
    .lte('created_at', comparisonEndDateStr);
  
  const previousTotalSocialEngagement = previousSocialData?.reduce((sum, item) => {
    return sum + (item.likes || 0) + (item.shares || 0) + (item.comments || 0);
  }, 0) || 0;
  
  const socialEngagementChange = previousTotalSocialEngagement > 0 
    ? ((totalSocialEngagement - previousTotalSocialEngagement) / previousTotalSocialEngagement) * 100 
    : 0;
  
  // Get search impressions
  const { data: searchData } = await supabase
    .from('search_impressions')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', startDateStr)
    .lte('created_at', nowStr);
  
  const totalSearchImpressions = searchData?.reduce((sum, item) => {
    return sum + (item.impressions || 0);
  }, 0) || 0;
  
  // Get previous search impressions
  const { data: previousSearchData } = await supabase
    .from('search_impressions')
    .select('*')
    .eq('dealership_id', dealershipId)
    .gte('created_at', comparisonStartDateStr)
    .lte('created_at', comparisonEndDateStr);
  
  const previousTotalSearchImpressions = previousSearchData?.reduce((sum, item) => {
    return sum + (item.impressions || 0);
  }, 0) || 0;
  
  const searchImpressionsChange = previousTotalSearchImpressions > 0 
    ? ((totalSearchImpressions - previousTotalSearchImpressions) / previousTotalSearchImpressions) * 100 
    : 0;
  
  // Get vehicle type breakdown
  const { data: vehicleTypesData } = await supabase
    .from('vehicles')
    .select('body_type, count')
    .eq('dealership_id', dealershipId)
    .eq('status', 'active')
    .group('body_type');
  
  // Calculate total for percentages
  const totalVehiclesByType = vehicleTypesData?.reduce((sum, item) => sum + item.count, 0) || 0;
  
  const vehicleTypeBreakdown = vehicleTypesData?.map(item => ({
    label: item.body_type || 'Unknown',
    value: item.count,
    percentage: totalVehiclesByType > 0 ? (item.count / totalVehiclesByType) * 100 : 0
  })) || [];
  
  // Get price range breakdown
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select('price')
    .eq('dealership_id', dealershipId)
    .eq('status', 'active');
  
  // Create price ranges
  const priceRanges = [
    { min: 0, max: 10000, label: 'Under $10k' },
    { min: 10000, max: 20000, label: '$10k-$20k' },
    { min: 20000, max: 30000, label: '$20k-$30k' },
    { min: 30000, max: 50000, label: '$30k-$50k' },
    { min: 50000, max: Number.MAX_SAFE_INTEGER, label: 'Over $50k' },
  ];
  
  // Count vehicles in each price range
  const priceRangeCounts = priceRanges.map(range => {
    const count = vehiclesData?.filter(v => 
      v.price >= range.min && v.price < range.max
    ).length || 0;
    
    return {
      label: range.label,
      value: count,
      percentage: vehiclesData && vehiclesData.length > 0 
        ? (count / vehiclesData.length) * 100 
        : 0
    };
  });
  
  // Get daily views for chart
  const dailyViews: { [date: string]: number } = {};
  viewsData?.forEach(view => {
    const date = new Date(view.viewed_at).toISOString().split('T')[0];
    dailyViews[date] = (dailyViews[date] || 0) + 1;
  });
  
  // Convert to array format for chart
  const viewsByDay = Object.entries(dailyViews).map(([date, views]) => ({
    date,
    views
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  // Get daily inquiries for chart
  const dailyInquiries: { [date: string]: number } = {};
  leadsData?.forEach(lead => {
    const date = new Date(lead.created_at).toISOString().split('T')[0];
    dailyInquiries[date] = (dailyInquiries[date] || 0) + 1;
  });
  
  // Convert to array format for chart
  const inquiriesByDay = Object.entries(dailyInquiries).map(([date, inquiries]) => ({
    date,
    inquiries
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  // Get top performing listings
  const { data: vehiclesWithViews } = await supabase
    .from('vehicles')
    .select(`
      id, make, model, year, trim, 
      views:vehicle_views(count), 
      inquiries:leads(count)
    `)
    .eq('dealership_id', dealershipId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);
  
  const topPerformingListings = vehiclesWithViews?.map(vehicle => {
    const views = vehicle.views[0]?.count || 0;
    const inquiries = vehicle.inquiries[0]?.count || 0;
    const engagementRate = views > 0 ? (inquiries / views) * 100 : 0;
    
    return {
      id: vehicle.id,
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim(),
      views,
      inquiries,
      engagementRate
    };
  }).sort((a, b) => b.views - a.views) || [];
  
  // Get market research queries count
  const { count: marketResearchQueries } = await supabase
    .from('market_searches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', dealershipId)
    .gte('timestamp', startDateStr)
    .lte('timestamp', nowStr);
  
  // Get content generations count
  const { count: contentGenerations } = await supabase
    .from('vehicle_content')
    .select('*', { count: 'exact', head: true })
    .eq('dealership_id', dealershipId)
    .gte('generated_at', startDateStr)
    .lte('generated_at', nowStr);
  
  // Construct the final analytics object
  return {
    totalVehicles: {
      label: 'Total Vehicles',
      value: totalVehicles || 0,
      change: previousActiveListings && activeListings 
        ? ((activeListings - previousActiveListings) / previousActiveListings) * 100 
        : 0,
      changeDirection: activeListings > previousActiveListings ? 'up' : activeListings < previousActiveListings ? 'down' : 'neutral'
    },
    activeListings: {
      label: 'Active Listings',
      value: activeListings || 0,
      change: previousActiveListings 
        ? ((activeListings - previousActiveListings) / previousActiveListings) * 100 
        : 0,
      changeDirection: activeListings > previousActiveListings ? 'up' : activeListings < previousActiveListings ? 'down' : 'neutral'
    },
    totalViews: {
      label: 'Total Views',
      value: totalViews,
      change: viewChange,
      changeDirection: viewChange > 0 ? 'up' : viewChange < 0 ? 'down' : 'neutral'
    },
    leadConversion: {
      label: 'Lead Conversion',
      value: leadConversion,
      change: leadConversionChange,
      changeDirection: leadConversionChange > 0 ? 'up' : leadConversionChange < 0 ? 'down' : 'neutral'
    },
    socialEngagement: {
      label: 'Social Engagement',
      value: totalSocialEngagement,
      change: socialEngagementChange,
      changeDirection: socialEngagementChange > 0 ? 'up' : socialEngagementChange < 0 ? 'down' : 'neutral'
    },
    searchImpressions: {
      label: 'Search Impressions',
      value: totalSearchImpressions,
      change: searchImpressionsChange,
      changeDirection: searchImpressionsChange > 0 ? 'up' : searchImpressionsChange < 0 ? 'down' : 'neutral'
    },
    vehicleTypeBreakdown,
    priceRangeBreakdown: priceRangeCounts,
    viewsByDay,
    inquiriesByDay,
    topPerformingListings,
    marketResearchQueries: marketResearchQueries || 0,
    contentGenerations: contentGenerations || 0
  };
}

/**
 * Track a vehicle view event
 */
export async function trackVehicleView(vehicleId: string, userId?: string) {
  const supabase = createServerClient();
  
  // Get vehicle details to get dealership ID
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('dealership_id')
    .eq('id', vehicleId)
    .single();
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  // Record the view
  await supabase
    .from('vehicle_views')
    .insert({
      vehicle_id: vehicleId,
      dealership_id: vehicle.dealership_id,
      user_id: userId,
      viewed_at: new Date().toISOString()
    });
}

/**
 * Track a lead generation event
 */
export async function trackLead(
  vehicleId: string, 
  leadInfo: { 
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }
) {
  const supabase = createServerClient();
  
  // Get vehicle details to get dealership ID
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('dealership_id')
    .eq('id', vehicleId)
    .single();
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  // Record the lead
  await supabase
    .from('leads')
    .insert({
      vehicle_id: vehicleId,
      dealership_id: vehicle.dealership_id,
      name: leadInfo.name,
      email: leadInfo.email,
      phone: leadInfo.phone,
      message: leadInfo.message,
      created_at: new Date().toISOString()
    });
}

/**
 * Track a social media engagement event
 */
export async function trackSocialEngagement(
  vehicleId: string,
  platform: 'facebook' | 'twitter' | 'instagram',
  engagement: {
    likes?: number;
    shares?: number;
    comments?: number;
  }
) {
  const supabase = createServerClient();
  
  // Get vehicle details to get dealership ID
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('dealership_id')
    .eq('id', vehicleId)
    .single();
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  // Record the social engagement
  await supabase
    .from('social_engagement')
    .insert({
      vehicle_id: vehicleId,
      dealership_id: vehicle.dealership_id,
      platform,
      likes: engagement.likes || 0,
      shares: engagement.shares || 0,
      comments: engagement.comments || 0,
      created_at: new Date().toISOString()
    });
}

/**
 * Track a search impression event
 */
export async function trackSearchImpression(
  dealershipId: string,
  searchTerm: string,
  impressions: number = 1
) {
  const supabase = createServerClient();
  
  // Record the search impression
  await supabase
    .from('search_impressions')
    .insert({
      dealership_id: dealershipId,
      search_term: searchTerm,
      impressions,
      created_at: new Date().toISOString()
    });
}

export default {
  getDealershipAnalytics,
  trackVehicleView,
  trackLead,
  trackSocialEngagement,
  trackSearchImpression
}; 