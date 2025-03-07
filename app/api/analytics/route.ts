import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getDealershipAnalytics, ActivityPeriod } from '@/lib/analytics';

/**
 * GET handler for analytics data
 * GET /api/analytics?period=month
 */
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Check authentication
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Extract period from query parameters
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') || 'month') as ActivityPeriod;
  
  // Ensure valid period value
  if (!['day', 'week', 'month', 'year'].includes(period)) {
    return NextResponse.json(
      { error: 'Invalid period parameter. Must be one of: day, week, month, year' },
      { status: 400 }
    );
  }
  
  try {
    const dealershipId = session.user.user_metadata?.dealership_id as string;
    
    if (!dealershipId) {
      return NextResponse.json(
        { error: 'No dealership associated with this account' },
        { status: 400 }
      );
    }
    
    // Get analytics data for the requested period
    const analyticsData = await getDealershipAnalytics(dealershipId, period);
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 