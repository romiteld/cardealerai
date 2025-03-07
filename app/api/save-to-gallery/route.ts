import { NextResponse } from 'next/server';
import { optimizedUpload, formatTransformation } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { public_id, transformations, settings } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'No image ID provided' },
        { status: 400 }
      );
    }

    // Create the source URL from public_id
    const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${public_id}`;
    
    // Get transformations either from the provided array or format them from settings
    const transformation = transformations || (settings ? formatTransformation(settings) : undefined);

    // Upload the image to the gallery with transformations
    const result = await optimizedUpload(imageUrl, {
      folder: 'gallery',
      transformation,
      resource_type: 'image',
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return NextResponse.json(
      { error: 'Failed to save image to gallery' },
      { status: 500 }
    );
  }
} 