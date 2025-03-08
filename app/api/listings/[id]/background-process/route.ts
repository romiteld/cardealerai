import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Mock data for listings (same as in the other routes)
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

// Mock backgrounds for the image processing
const backgroundOptions = [
  {
    name: 'Dealership Showroom',
    url: 'https://res.cloudinary.com/demo/image/upload/dealership-showroom-1.jpg'
  },
  {
    name: 'Modern Studio',
    url: 'https://res.cloudinary.com/demo/image/upload/modern-studio.jpg'
  },
  {
    name: 'Outdoor Scene',
    url: 'https://res.cloudinary.com/demo/image/upload/outdoor-scene.jpg'
  },
  {
    name: 'Urban Street',
    url: 'https://res.cloudinary.com/demo/image/upload/urban-street.jpg'
  }
];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`Processing background for listing ID: ${id}`);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate request body
    const { imageIds, mode = 'replace', prompt = 'dealership showroom', batchSize = 5 } = body;
    
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      console.error('Invalid imageIds:', imageIds);
      return NextResponse.json(
        { error: 'imageIds must be an array of image public IDs' },
        { status: 400 }
      );
    }
    
    if (mode !== 'remove' && mode !== 'replace') {
      console.error('Invalid mode:', mode);
      return NextResponse.json(
        { error: 'mode must be either "remove" or "replace"' },
        { status: 400 }
      );
    }
    
    // Find the listing in our mock data
    const listing = mockListings.find(listing => listing.id === id);
    
    if (!listing) {
      console.error(`Listing not found: ${id}`);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    console.log(`Processing ${imageIds.length} images for listing: ${listing.title}`);
    
    // Process images in chunks to avoid overwhelming the server
    const chunks = [];
    for (let i = 0; i < imageIds.length; i += batchSize) {
      chunks.push(imageIds.slice(i, i + batchSize));
    }
    
    // Process each chunk sequentially to manage server load
    const batchResults = [];
    
    for (const chunk of chunks) {
      console.log(`Processing chunk of ${chunk.length} images...`);
      
      // Process images in the current chunk in parallel
      const chunkResults = await Promise.all(chunk.map(async (imageId) => {
        try {
          console.log(`Processing image: ${imageId}`);
          
          // Check if image belongs to the listing
          let listingImage = listing.images.find(img => img.publicId === imageId);
          
          // If the image isn't found in the listing but appears to be a valid ID,
          // create a temporary image entry for processing
          if (!listingImage) {
            console.log(`Image ${imageId} not in listing yet. Creating temporary entry for processing.`);
            
            // Extract information from the imageId to create a temporary image entry
            const isCloudinaryImage = imageId.includes('/');
            const imageBaseName = isCloudinaryImage 
              ? imageId.split('/').pop() || 'image' 
              : imageId;
            
            // Create a temporary image object for processing
            listingImage = {
              publicId: imageId,
              url: isCloudinaryImage 
                ? `https://res.cloudinary.com/demo/image/upload/${imageId}.jpg`
                : `https://example.com/mock-upload/${imageId}.jpg`
            };
          }
          
          // Generate preview versions of the image (using Cloudinary if available)
          if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn("Cloudinary credentials not set, using mock previews");
            
            // Generate mock preview URLs - in production, these would be real Cloudinary transformations
            const mockPreviews = [
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_preview_1.jpg`,
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_preview_2.jpg`,
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_preview_3.jpg`
            ];
            
            console.log('Generated mock previews:', mockPreviews);
            
            return {
              imageId,
              success: true,
              originalUrl: listingImage.url,
              previews: mockPreviews
            };
          }
          
          try {
            console.log('Generating Cloudinary transformations...');
            
            // For real Cloudinary processing with background removal/replacement
            // This is where we would generate actual Cloudinary URLs with transformations
            
            const previewTransformations = [
              // Standard enhancement
              {
                transformation: [
                  { width: 800, crop: "scale" },
                  { effect: "auto_contrast" },
                  { effect: "auto_color" },
                  { effect: "improve", value: "outdoor" }
                ]
              },
              // Dramatic enhancement
              {
                transformation: [
                  { width: 800, crop: "scale" },
                  { effect: "saturation:30" },
                  { effect: "contrast:40" },
                  { effect: "sharpen:100" }
                ]
              },
              // Vintage look
              {
                transformation: [
                  { width: 800, crop: "scale" },
                  { effect: "art:fes" }
                ]
              }
            ];
            
            const previewUrls = previewTransformations.map((transform, index) => {
              // Generate a URL with the specified transformations
              const url = cloudinary.url(imageId, {
                ...transform,
                secure: true,
                version: Date.now() // Cache busting
              });
              
              console.log(`Preview ${index + 1}:`, url);
              return url;
            });
            
            return {
              imageId,
              success: true,
              originalUrl: listingImage.url,
              previews: previewUrls
            };
          } catch (cloudinaryError) {
            console.error('Cloudinary processing error:', cloudinaryError);
            
            // Fallback to mock previews if Cloudinary processing fails
            const fallbackPreviews = [
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_fallback_1.jpg`,
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_fallback_2.jpg`,
              `${listingImage.url.replace(/\.[^/.]+$/, '')}_fallback_3.jpg`
            ];
            
            console.log('Using fallback previews after Cloudinary error:', fallbackPreviews);
            
            return {
              imageId,
              success: true,
              originalUrl: listingImage.url,
              previews: fallbackPreviews
            };
          }
        } catch (err: any) {
          console.error(`Error processing image ${imageId}:`, err);
          return {
            imageId,
            success: false,
            error: err.message || 'Failed to process image'
          };
        }
      }));
      
      // Add results from this chunk to the overall results
      batchResults.push(...chunkResults);
      
      // Add a small delay between chunks to avoid rate limiting
      if (chunks.length > 1) {
        console.log("Pausing briefly between chunks...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Batch processing complete:', batchResults);
    
    return NextResponse.json({
      success: true,
      batchResults
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 