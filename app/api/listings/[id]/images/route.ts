import { NextResponse } from 'next/server';

// In a real app, we would interact with the database
// For now, we'll use the same mock data and update it in memory

const mockListings = [
  {
    id: 'listing_123',
    title: '2023 Honda Civic EX',
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/honda-civic.jpg',
        publicId: 'car-images/honda-civic'
      }
    ]
  },
  {
    id: 'listing_456',
    title: '2022 Toyota Camry SE',
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/toyota-camry.jpg',
        publicId: 'car-images/toyota-camry'
      }
    ]
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find the listing in our mock data
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      images: listing.images,
      count: listing.images.length
    });
  } catch (error: any) {
    console.error('Error fetching listing images:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { images } = await request.json();
    
    // Find the listing in our mock data
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images array is required' },
        { status: 400 }
      );
    }
    
    // In a real app, we would update the database
    // For now, just return a success message
    
    return NextResponse.json({
      success: true,
      message: `Added ${images.length} images to listing ${id}`,
      images
    });
  } catch (error: any) {
    console.error('Error adding listing images:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check for needed data
    if (!body.selectedImages && !body.selectedImageUrls) {
      return NextResponse.json(
        { error: 'Selected images data is required' },
        { status: 400 }
      );
    }
    
    // Find the listing in our mock data
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // In a real app, we would update the database with the selected images
    // For now, just return a success message
    
    return NextResponse.json({
      success: true,
      message: `Updated images for listing ${id}`,
      images: body.selectedImages || body.selectedImageUrls,
      count: (body.selectedImages || body.selectedImageUrls).length
    });
  } catch (error: any) {
    console.error('Error updating listing images:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 