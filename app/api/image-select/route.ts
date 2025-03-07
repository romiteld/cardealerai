import { NextResponse } from 'next/server';
import { withRetry } from '../../lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

interface SelectImageRequest {
  publicId: string;
  purpose: 'content' | 'social' | 'marketing';
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    format?: string;
    quality?: string | number;
    socialPlatform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  };
}

// Platform-specific transformations
const platformPresets = {
  facebook: {
    timeline: { width: 1200, height: 630 },
    post: { width: 1200, height: 1200 },
    story: { width: 1080, height: 1920 },
  },
  instagram: {
    post: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    portrait: { width: 1080, height: 1350 },
  },
  twitter: {
    post: { width: 1200, height: 675 },
    header: { width: 1500, height: 500 },
  },
  linkedin: {
    post: { width: 1200, height: 627 },
    banner: { width: 1584, height: 396 },
  },
} as const;

export async function POST(request: Request) {
  try {
    const { publicId, purpose, options = {} } = await request.json() as SelectImageRequest;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    let transformation: any[] = [];

    switch (purpose) {
      case 'social':
        if (!options.socialPlatform) {
          return NextResponse.json(
            { error: 'Social platform is required for social media purpose' },
            { status: 400 }
          );
        }

        const platformConfig = platformPresets[options.socialPlatform];
        if (!platformConfig) {
          return NextResponse.json(
            { error: 'Invalid social platform' },
            { status: 400 }
          );
        }

        // Generate variations for different post types
        const variations = await Promise.all(
          Object.entries(platformConfig).map(async ([type, dims]) => {
            const url = cloudinary.url(publicId, {
              transformation: [
                { width: dims.width, height: dims.height, crop: 'fill', gravity: 'auto' },
                { quality: 'auto:best', fetch_format: 'auto' },
              ],
              secure: true,
            });

            return {
              type,
              url,
              width: dims.width,
              height: dims.height,
            };
          })
        );

        return NextResponse.json({
          success: true,
          purpose,
          platform: options.socialPlatform,
          variations,
        });

      case 'content':
        // Optimize for content display
        transformation = [
          { width: options.width || 'auto', crop: options.crop || 'scale' },
          { quality: 'auto:best', fetch_format: 'auto' },
          { dpr: 'auto' },
        ];
        break;

      case 'marketing':
        // High-quality marketing transformations
        transformation = [
          { width: options.width || 1920, crop: options.crop || 'fill', gravity: 'auto' },
          { quality: options.quality || 90 },
          { fetch_format: options.format || 'auto' },
          { dpr: 'auto' },
        ];
        break;
    }

    // Generate URL for content and marketing purposes
    const url = cloudinary.url(publicId, {
      transformation,
      secure: true,
    });

    return NextResponse.json({
      success: true,
      purpose,
      url,
      transformation,
    });

  } catch (error: any) {
    console.error('Image selection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image selection',
        details: error.message
      },
      { status: 500 }
    );
  }
} 