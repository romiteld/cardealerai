import { NextResponse } from 'next/server';
import { batchEnhanceImages, enhancementPresets } from '../../lib/cloudinary';

interface BatchEnhanceRequest {
  publicIds: string[];
  preset?: keyof typeof enhancementPresets;
}

type EnhanceResult = {
  status: 'success' | 'error';
  publicId: string;
  url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  eager?: any;
  error?: string;
};

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  eager: any;
};

export async function POST(request: Request) {
  try {
    const { publicIds, preset } = await request.json() as BatchEnhanceRequest;

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one public ID is required' },
        { status: 400 }
      );
    }

    if (preset && !(preset in enhancementPresets)) {
      return NextResponse.json(
        { error: 'Invalid enhancement preset' },
        { status: 400 }
      );
    }

    // Process images in batch
    const results = await batchEnhanceImages(publicIds, preset);
    // Format results
    const formattedResults = results.map((result, index) => ({
      status: 'success',
      publicId: publicIds[index],
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      eager: result.eager
    }));

    return NextResponse.json({
      results: formattedResults,
      summary: {
        total: publicIds.length,
        successful: formattedResults.filter((r) => (r as EnhanceResult).status === 'success').length,
        failed: formattedResults.filter((r) => (r as EnhanceResult).status === 'error').length,
      }
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    return NextResponse.json(
      { error: 'Failed to process image batch' },
      { status: 500 }
    );
  }
} 