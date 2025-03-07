import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { processBatchBackground } from '@/lib/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GenerateBackgroundRequest {
  publicId: string;
  prompt: string;
  mode?: 'remove' | 'replace';
}

interface AlternativeUrls {
  [key: string]: string;
}

// Helper function to map prompts to colors
function getColorsFromPrompt(prompt: string): { primary: string; secondary: string } {
  const prompt_lower = prompt.toLowerCase();
  
  // Map common prompt terms to color pairs
  if (prompt_lower.includes('luxury') || prompt_lower.includes('showroom')) {
    return { primary: 'darkblue', secondary: 'black' };
  }
  if (prompt_lower.includes('beach') || prompt_lower.includes('ocean') || prompt_lower.includes('sea')) {
    return { primary: 'azure', secondary: 'lightblue' };
  }
  if (prompt_lower.includes('sunset') || prompt_lower.includes('dusk')) {
    return { primary: 'orange', secondary: 'red' };
  }
  if (prompt_lower.includes('mountain') || prompt_lower.includes('hill') || prompt_lower.includes('cliff')) {
    return { primary: 'darkgreen', secondary: 'brown' };
  }
  if (prompt_lower.includes('desert') || prompt_lower.includes('sand')) {
    return { primary: 'khaki', secondary: 'sandybrown' };
  }
  if (prompt_lower.includes('night') || prompt_lower.includes('dark')) {
    return { primary: 'midnightblue', secondary: 'navy' };
  }
  if (prompt_lower.includes('snow') || prompt_lower.includes('winter')) {
    return { primary: 'aliceblue', secondary: 'white' };
  }
  if (prompt_lower.includes('city') || prompt_lower.includes('urban')) {
    return { primary: 'gray', secondary: 'darkgray' };
  }
  
  // Default elegant background
  return { primary: 'darkblue', secondary: 'black' };
}

export async function POST(request: Request) {
  try {
    const { publicId, prompt, mode = 'replace' } = await request.json() as GenerateBackgroundRequest;
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    console.log(`Generating background for image ${publicId} with prompt: "${prompt}" using mode: ${mode}`);

    // Process the image using the batch processor (even though it's a single image)
    const result = await processBatchBackground([publicId], mode, prompt);

    if (result.batchResults.length === 0 || !result.batchResults[0].success) {
      const error = result.batchResults[0]?.error || 'Failed to process image';
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    // Make sure we have valid results
    const firstResult = result.batchResults[0];
    
    if (!firstResult.previews || firstResult.previews.length === 0) {
      return NextResponse.json(
        { error: 'No preview images were generated' },
        { status: 500 }
      );
    }

    // Create a map of alternative URLs
    const alternativeUrls: AlternativeUrls = {};
    firstResult.previews.forEach((url, idx) => {
      alternativeUrls[`option_${idx+1}`] = url;
    });

    // Return all options so the front-end can choose
    return NextResponse.json({
      original_id: publicId,
      enhanced_url: firstResult.previews[0], // Default is the first option
      alternative_urls: alternativeUrls,
      background_type: mode,
      success: true
    });
  } catch (error) {
    console.error('Error generating background:', error);
    return NextResponse.json(
      { error: 'Failed to generate background', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 