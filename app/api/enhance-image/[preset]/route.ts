import { NextResponse } from 'next/server';
import { applyEnhancement } from '../../../lib/cloudinary';

export async function POST(
  request: Request,
  { params }: { params: { preset: string } }
) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const enhancedUrl = await applyEnhancement(publicId, params.preset);

    return NextResponse.json({ url: enhancedUrl });
  } catch (error) {
    console.error('Error applying preset:', error);
    return NextResponse.json(
      { error: 'Failed to apply preset' },
      { status: 500 }
    );
  }
} 