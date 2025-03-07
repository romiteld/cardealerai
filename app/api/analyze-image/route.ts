import { NextResponse } from 'next/server';
import { analyzeImage, ImageAnalysis } from '../../lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const analysis: ImageAnalysis = await analyzeImage(publicId);

    // Return the analysis results
    return NextResponse.json({
      success: true,
      analysis: {
        colors: analysis.colors,
        faces: analysis.faces,
        labels: analysis.labels,
        metadata: analysis.metadata,
        quality: analysis.quality
      }
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 