import { NextResponse } from 'next/server';

// In a real app, we would interact with the database
// For now, we'll use the same mock data and update it in memory

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
    
    // Find the listing
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      images: listing.images
    });
  } catch (error) {
    console.error('Error fetching listing images:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
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
    
    console.log(`Updating images for listing ${id}`);
    console.log('Request body:', body);
    
    // Validate request body
    if (!body.selectedImages && !body.selectedImageUrls) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }
    
    // Find the listing
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Handle various image update formats
    const imageData = body.selectedImages || body.selectedImageUrls || [];
    console.log('Processing imageData:', imageData);
    
    // Track the updates for response
    const updates = {
      added: 0,
      updated: 0,
      unchanged: 0,
      current_count: listing.images.length
    };
    
    // Update the listing's images
    // Different handling based on the data format
    if (Array.isArray(imageData)) {
      if (imageData.length > 0) {
        // Check if we're getting a batch of updates or a complete replacement
        const isBatchUpdate = body.mode === 'batch';
        
        // For batch updates, we'll add to or update existing images rather than replacing
        if (isBatchUpdate) {
          // Process each image in the batch
          for (const item of imageData) {
            if (typeof item === 'string') {
              // It's a URL string
              const publicId = item.split('/').pop()?.split('.')[0] || 'unknown';
              const existingIndex = listing.images.findIndex(img => img.publicId === publicId);
              
              if (existingIndex >= 0) {
                // Update existing
                listing.images[existingIndex].url = item;
                updates.updated++;
              } else {
                // Add new
                listing.images.push({
                  url: item,
                  publicId
                });
                updates.added++;
              }
            } else if (item.originalId && item.enhancedUrl) {
              // It's an { originalId, enhancedUrl } object
              const existingIndex = listing.images.findIndex(img => img.publicId === item.originalId);
              
              if (existingIndex >= 0) {
                // Update existing
                listing.images[existingIndex].url = item.enhancedUrl;
                updates.updated++;
              } else {
                // Add new
                listing.images.push({
                  url: item.enhancedUrl,
                  publicId: item.originalId
                });
                updates.added++;
              }
            } else if (item.url && item.publicId) {
              // It's an { url, publicId } object
              const existingIndex = listing.images.findIndex(img => img.publicId === item.publicId);
              
              if (existingIndex >= 0) {
                // Update existing
                listing.images[existingIndex] = item;
                updates.updated++;
              } else {
                // Add new
                listing.images.push(item);
                updates.added++;
              }
            }
          }
        } else {
          // Complete replacement - we're getting the full image set
          const oldCount = listing.images.length;
          
          if (typeof imageData[0] === 'string') {
            // Array of image URLs
            listing.images = imageData.map(url => ({
              url,
              publicId: url.split('/').pop()?.split('.')[0] || 'unknown'
            }));
          } else if (imageData[0].originalId && imageData[0].enhancedUrl) {
            // Array of { originalId, enhancedUrl } objects
            listing.images = imageData.map(item => ({
              url: item.enhancedUrl,
              publicId: item.originalId
            }));
          } else if (imageData[0].url) {
            // Array of { url, publicId } objects
            listing.images = imageData;
          } else {
            return NextResponse.json(
              { error: 'Invalid image data format' },
              { status: 400 }
            );
          }
          
          updates.updated = Math.min(oldCount, listing.images.length);
          updates.added = Math.max(0, listing.images.length - oldCount);
        }
      } else {
        // Empty array - clear images
        updates.updated = listing.images.length;
        listing.images = [];
      }
    } else {
      return NextResponse.json(
        { error: 'Image data must be an array' },
        { status: 400 }
      );
    }
    
    console.log(`Updated listing images:`, listing.images);
    updates.current_count = listing.images.length;
    
    return NextResponse.json({
      success: true,
      images: listing.images,
      count: listing.images.length,
      updates
    });
  } catch (error) {
    console.error('Error updating listing images:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 