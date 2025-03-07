import { NextResponse } from 'next/server';
import { withRetry } from '../../lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  eager?: Array<{
    width: number;
    height: number;
    secure_url: string;
  }>;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await withRetry(() => 
      cloudinary.search
        .expression('folder:gallery')
        .sort_by('created_at', 'desc')
        .with_field('context')
        .max_results(100)
        .execute()
    );

    if (!result.resources || result.resources.length === 0) {
      return NextResponse.json({
        images: [],
        message: 'No images found in gallery'
      });
    }

    return NextResponse.json({
      images: (result.resources as CloudinaryResource[]).map(resource => ({
        ...resource,
        formats: resource.eager?.map(version => ({
          width: version.width,
          height: version.height,
          url: version.secure_url,
        })),
      })),
      total: result.total_count,
    });
  } catch (error: any) {
    console.error('Error fetching gallery images:', error);
    const errorMessage = error.error?.message || 'Failed to fetch gallery images';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined 
      },
      { status: 500 }
    );
  }
} 