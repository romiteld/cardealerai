import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateVehicleContent, VehicleInfo, GenerationOptions } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the request body
    const { vehicleInfo, options } = await request.json() as {
      vehicleInfo: VehicleInfo;
      options?: GenerationOptions;
    };

    // Validate vehicle info
    if (!vehicleInfo || !vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year) {
      return NextResponse.json(
        { error: 'Missing required vehicle information' },
        { status: 400 }
      );
    }

    // Get dealership information to include in generation
    const { data: userData } = await supabase
      .from('users')
      .select('*, dealerships(name, city, state)')
      .eq('id', session.user.id)
      .single();

    const dealershipName = userData?.dealerships?.name;
    
    // Generate content with OpenAI
    const generatedContent = await generateVehicleContent(
      vehicleInfo,
      { 
        ...options, 
        dealershipName,
      }
    );

    // Save the generated content to the database if a listing ID is provided
    if (vehicleInfo.stockNumber) {
      const { data: listing } = await supabase
        .from('vehicles')
        .select('id')
        .eq('stock_number', vehicleInfo.stockNumber)
        .single();

      if (listing) {
        await supabase
          .from('vehicle_content')
          .upsert({
            vehicle_id: listing.id,
            description: generatedContent.description,
            highlights: generatedContent.highlights,
            seo_title: generatedContent.seoTitle,
            seo_description: generatedContent.seoDescription,
            generated_at: new Date().toISOString(),
          });
      }
    }

    return NextResponse.json(generatedContent);
  } catch (error: any) {
    console.error('Error generating content:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 