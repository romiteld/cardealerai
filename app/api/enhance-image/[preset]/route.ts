import { NextResponse } from 'next/server';
import { applyEnhancement } from '@/lib/cloudinary';

export async function POST(
  request: Request,
  { params }: { params: { preset: string } }
) {
  try {
    console.log(`Processing preset request: ${params.preset}`);
    const { publicId } = await request.json();

    if (!publicId) {
      console.error('Public ID is required but was not provided');
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    console.log(`Applying preset ${params.preset} to image ${publicId}`);
    const enhancedUrl = await applyEnhancement(publicId, params.preset);
    console.log(`Enhanced URL: ${enhancedUrl}`);

    return NextResponse.json({ url: enhancedUrl });
  } catch (error) {
    console.error('Error applying preset:', error);
    return NextResponse.json(
      { error: 'Failed to apply preset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 