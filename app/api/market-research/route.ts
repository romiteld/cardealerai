import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { searchSimilarVehicles, analyzePrices, getTrendingVehicles } from '@/lib/firecrawl';
import { VehicleSearchParams } from '@/lib/firecrawl';

/**
 * GET handler for trending vehicles
 * GET /api/market-research?category=suv
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

  // Extract the category from the URL query parameters
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as 'suv' | 'sedan' | 'truck' | 'luxury' | 'electric' | undefined;

  try {
    // Get trending vehicles data
    const trendingData = await getTrendingVehicles(category);
    
    return NextResponse.json({
      success: true,
      data: trendingData
    });
  } catch (error) {
    console.error('Error fetching trending vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending vehicles' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for price analysis
 * POST /api/market-research
 * Body: { make, model, year?, trim?, radius?, zipCode? }
 */
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  // Check authentication
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.make || !body.model) {
      return NextResponse.json(
        { error: 'Make and model are required' },
        { status: 400 }
      );
    }
    
    // Prepare search parameters
    const searchParams: VehicleSearchParams = {
      make: body.make,
      model: body.model,
      year: body.year,
      trim: body.trim,
      radius: body.radius || 50,
      zipCode: body.zipCode,
      maxResults: body.maxResults || 20
    };
    
    // Get the market analysis results
    const analysisResults = await analyzePrices(searchParams);
    
    // Optional: Log the search for analytics
    await supabase.from('market_searches').insert({
      user_id: session.user.id,
      search_params: searchParams,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      data: analysisResults
    });
  } catch (error) {
    console.error('Error analyzing market prices:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market prices' },
      { status: 500 }
    );
  }
} 