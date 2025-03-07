import { NextResponse } from 'next/server';

// This would normally connect to your database
// We'll provide mock data for demonstration purposes
const mockConnectedPlatforms = [
  {
    id: 'x',
    name: 'X (Twitter)',
    connected: true,
    tokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'cardealerai'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    connected: true,
    tokenExpires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'cardealerai'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    connected: false
  }
];

export async function GET(request: Request) {
  try {
    // In a real app, we would fetch from the database based on the user's credentials
    // For now, returning mock data
    return NextResponse.json(mockConnectedPlatforms);
  } catch (error: any) {
    console.error('Error fetching social platforms:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { platformId, accessToken } = await request.json();
    
    if (!platformId || !accessToken) {
      return NextResponse.json(
        { error: 'Platform ID and access token are required' },
        { status: 400 }
      );
    }
    
    // In a real app, we would validate the token, store it in the database, etc.
    
    return NextResponse.json({
      success: true,
      message: `Successfully connected ${platformId}`
    });
  } catch (error: any) {
    console.error('Error connecting social platform:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 