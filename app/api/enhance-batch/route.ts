import { NextResponse } from 'next/server';
import { processBatchBackground } from '@/lib/cloudinary';

interface BatchEnhanceRequest {
  imageIds: string[];
  mode?: 'remove' | 'replace';
  prompt?: string;
}

export async function POST(request: Request) {
  try {
    const { imageIds, mode = 'remove', prompt = 'dealership showroom' } = await request.json() as BatchEnhanceRequest;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one image ID is required' },
        { status: 400 }
      );
    }

    // Process images in batch with the new function
    const result = await processBatchBackground(imageIds, mode, prompt);

    // Return the batch results
    return NextResponse.json({
      batchResults: result.batchResults,
      summary: {
        total: imageIds.length,
        successful: result.successCount,
        failed: result.failCount,
      }
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    return NextResponse.json(
      { error: 'Failed to process image batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 