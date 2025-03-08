import { NextResponse } from 'next/server';

// Mock data for listings (same as in the main listings route)
const mockListings = [
  {
    id: 'listing_123',
    title: '2023 Honda Civic EX',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    price: 25999,
    mileage: 5000,
    status: 'published',
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/honda-civic.jpg',
        publicId: 'car-images/honda-civic'
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing_456',
    title: '2022 Toyota Camry SE',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 27500,
    mileage: 12000,
    status: 'published',
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/toyota-camry.jpg',
        publicId: 'car-images/toyota-camry'
      }
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'listing_789',
    title: '2021 Ford F-150 XLT',
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    price: 39995,
    mileage: 18500,
    status: 'published',
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/ford-f150.jpg',
        publicId: 'car-images/ford-f150'
      }
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper function to add CORS headers to a response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// CORS preflight request handler
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure params.id exists
    const { id } = params;
    if (!id) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      ));
    }
    
    // Find the listing in our mock data
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      ));
    }
    
    return addCorsHeaders(NextResponse.json(listing));
  } catch (error: any) {
    console.error('Error fetching listing:', error);
    return addCorsHeaders(NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    ));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Find the listing in our mock data
    const listingIndex = mockListings.findIndex(listing => listing.id === id);
    
    if (listingIndex === -1) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      ));
    }
    
    // In a real app, we would update the database
    // For now, just return a success message
    
    // Create updated listing without overwriting the id
    const updatedListing = {
      ...mockListings[listingIndex],
      ...body,
      id, // Ensure ID is preserved
      updatedAt: new Date().toISOString()
    };
    
    return addCorsHeaders(NextResponse.json(updatedListing));
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return addCorsHeaders(NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    ));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find the listing in our mock data
    const listingIndex = mockListings.findIndex(listing => listing.id === id);
    
    if (listingIndex === -1) {
      return addCorsHeaders(NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      ));
    }
    
    // In a real app, we would delete from the database
    // For now, just return a success message
    
    return addCorsHeaders(NextResponse.json({
      success: true,
      message: `Listing ${id} has been deleted`
    }));
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    return addCorsHeaders(NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    ));
  }
} 