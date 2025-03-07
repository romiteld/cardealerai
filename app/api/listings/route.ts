import { NextResponse } from 'next/server';

// Mock data for listings
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filter by status if provided
    let filteredListings = mockListings;
    if (status) {
      filteredListings = mockListings.filter(listing => listing.status === status);
    }
    
    // Apply pagination
    const paginatedListings = filteredListings.slice(offset, offset + limit);
    
    return NextResponse.json({
      data: paginatedListings,
      count: filteredListings.length,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real app, we would validate and save to the database
    
    // Generate a mock ID for the new listing
    const mockId = `listing_${Math.random().toString(36).substring(2, 10)}`;
    
    return NextResponse.json({
      id: mockId,
      ...body,
      status: body.status || 'draft',
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 