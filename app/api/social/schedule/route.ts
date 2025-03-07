import { NextResponse } from 'next/server';

// Mock data for scheduled posts
const mockScheduledPosts = [
  {
    id: 'schedule_abc123',
    listingId: 'listing_123',
    platform: 'x',
    scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    customMessage: 'Check out this amazing deal!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'schedule_def456',
    listingId: 'listing_456',
    platform: 'facebook',
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET(request: Request) {
  try {
    // In a real app, we would fetch from the database based on user permissions
    // For now, returning mock data
    return NextResponse.json({
      scheduledPosts: mockScheduledPosts,
      count: mockScheduledPosts.length
    });
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    // In a real app, we would delete from the database
    // For now, simulating success
    
    return NextResponse.json({
      success: true,
      message: `Scheduled post ${id} has been cancelled`
    });
  } catch (error: any) {
    console.error('Error cancelling scheduled post:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 