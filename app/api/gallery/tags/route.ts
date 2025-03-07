import { NextResponse } from 'next/server';
import { withRetry } from '../../../lib/cloudinary';
import { v2 as cloudinary } from 'cloudinary';

interface TagRequest {
  action: 'add' | 'remove' | 'replace';
  publicIds: string[];
  tags: string[];
}

export async function POST(request: Request) {
  try {
    const { action, publicIds, tags } = await request.json() as TagRequest;

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one public ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'At least one tag is required' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'add':
        // Add tags one by one to each image
        result = await Promise.all(
          publicIds.map(publicId =>
            withRetry(() => 
              Promise.all(tags.map(tag => 
                cloudinary.uploader.add_tag(tag, [publicId])
              ))
            )
          )
        );
        break;

      case 'remove':
        // Remove tags one by one from each image
        result = await Promise.all(
          publicIds.map(publicId =>
            withRetry(() => 
              Promise.all(tags.map(tag => 
                cloudinary.uploader.remove_tag(tag, [publicId])
              ))
            )
          )
        );
        break;

      case 'replace':
        result = await withRetry(() => 
          cloudinary.uploader.replace_tag(tags.join(','), publicIds)
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      publicIds,
      tags,
      result
    });
  } catch (error: any) {
    console.error('Tag management error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage tags',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Get tags for an image or list of tags
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const prefix = searchParams.get('prefix');

    if (!publicId && !prefix) {
      return NextResponse.json(
        { error: 'Either publicId or prefix is required' },
        { status: 400 }
      );
    }

    if (publicId) {
      // Get tags for specific image
      const result = await withRetry(() => 
        cloudinary.api.resource(publicId, {
          fields: 'tags',
        })
      );

      return NextResponse.json({
        success: true,
        publicId,
        tags: result.tags || []
      });
    } else {
      // Get all tags with prefix
      const result = await withRetry(() => 
        cloudinary.api.tags({
          prefix,
          max_results: 100
        })
      );

      return NextResponse.json({
        success: true,
        tags: result.tags || []
      });
    }
  } catch (error: any) {
    console.error('Tag retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve tags',
        details: error.message
      },
      { status: 500 }
    );
  }
} 