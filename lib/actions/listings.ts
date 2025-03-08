'use server';

// Mock data for listings (same as in api/listings/route.ts)
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

export type Vehicle = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status: string;
  images: {
    url: string;
    publicId: string;
  }[];
  createdAt: string;
  
  // Additional properties that may be present
  description?: string;
  vin?: string;
  exteriorColor?: string;
  interiorColor?: string;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  features?: string[];
  updatedAt?: string;
  
  // Properties used in vehicle details page
  trim?: string;
  color?: string;
  bodyType?: string;
  stockNumber?: string;
};

/**
 * Get all vehicle listings with optional filtering and pagination
 */
export async function getVehicleListings({
  status,
  limit = 50,
  offset = 0
}: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    // Filter by status if provided
    let filteredListings = mockListings;
    if (status && status !== 'all') {
      filteredListings = mockListings.filter(listing => listing.status === status);
    }
    
    // Apply pagination
    const paginatedListings = filteredListings.slice(offset, offset + limit);
    
    return {
      data: paginatedListings as Vehicle[],
      count: filteredListings.length,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

/**
 * Get a single vehicle listing by ID
 */
export async function getVehicleListingById(id: string) {
  try {
    const listing = mockListings.find(item => item.id === id);
    
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    return listing as Vehicle;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}

/**
 * Create a new vehicle listing
 */
export async function createVehicleListing(data: Partial<Vehicle>) {
  try {
    // Generate a mock ID for the new listing
    const mockId = `listing_${Math.random().toString(36).substring(2, 10)}`;
    
    const newListing = {
      id: mockId,
      ...data,
      status: data.status || 'draft',
      createdAt: new Date().toISOString()
    };
    
    // In a real app, we would save this to the database
    
    return newListing as Vehicle;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
}

/**
 * Update an existing vehicle listing
 */
export async function updateVehicleListing(id: string, data: Partial<Vehicle>) {
  try {
    const listingIndex = mockListings.findIndex(item => item.id === id);
    
    if (listingIndex === -1) {
      throw new Error('Listing not found');
    }
    
    // In a real app, we would update the database
    
    return {
      ...mockListings[listingIndex],
      ...data,
      id, // Ensure ID is preserved
      updatedAt: new Date().toISOString()
    } as Vehicle;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

/**
 * Delete a vehicle listing
 */
export async function deleteVehicleListing(id: string) {
  try {
    const listingIndex = mockListings.findIndex(item => item.id === id);
    
    if (listingIndex === -1) {
      throw new Error('Listing not found');
    }
    
    // In a real app, we would delete from the database
    
    return { success: true, message: `Listing ${id} has been deleted` };
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
} 