import { NextResponse } from 'next/server';
import { withRetry } from '../../../lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

interface ManageRequest {
  action: 'delete' | 'rename';
  publicId: string;
  newPublicId?: string;
}

export async function POST(request: Request) {
  try {
    const { action, publicId, newPublicId } = await request.json() as ManageRequest;

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'delete':
        // Delete both the image and its derived resources
        const deleteResult = await withRetry(() => 
          Promise.all([
            cloudinary.uploader.destroy(publicId),
            cloudinary.api.delete_derived_resources([publicId])
          ])
        );
        
        return NextResponse.json({
          success: true,
          action: 'delete',
          publicId
        });

      case 'rename':
        if (!newPublicId) {
          return NextResponse.json(
            { error: 'New public ID is required for rename action' },
            { status: 400 }
          );
        }

        // Rename the image
        const renameResult = await withRetry(() => 
          cloudinary.uploader.rename(publicId, newPublicId, {
            overwrite: true,
            invalidate: true
          })
        );

        return NextResponse.json({
          success: true,
          action: 'rename',
          oldPublicId: publicId,
          newPublicId: renameResult.public_id,
          url: renameResult.secure_url
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Gallery management error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage gallery item',
        details: error.message
      },
      { status: 500 }
    );
  }
} 