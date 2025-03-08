import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    condition: 'Used',
    exteriorColor: 'Crystal Black Pearl',
    interiorColor: 'Gray',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Android Auto'],
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
    condition: 'Used',
    exteriorColor: 'Celestial Silver Metallic',
    interiorColor: 'Black',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    features: ['Bluetooth', 'Backup Camera', 'Leather Seats', 'Heated Seats'],
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
    condition: 'Used',
    exteriorColor: 'Oxford White',
    interiorColor: 'Medium Earth Gray',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: '4WD',
    features: ['Bluetooth', 'Backup Camera', 'Navigation System', 'Towing Package'],
    images: [
      {
        url: 'https://res.cloudinary.com/dtqezpvul/image/upload/v1707246137/car-images/ford-f150.jpg',
        publicId: 'car-images/ford-f150'
      }
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate request body
    const { generateDescription, generateFeatures, tone = 'professional' } = body;
    
    if (!generateDescription && !generateFeatures) {
      return NextResponse.json(
        { error: 'At least one of generateDescription or generateFeatures must be true' },
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
    
    // Construct a prompt for OpenAI based on listing details
    let prompt = `Vehicle information:
- Make: ${listing.make}
- Model: ${listing.model}
- Year: ${listing.year}
- Mileage: ${listing.mileage} miles
- Price: $${listing.price}
- Condition: ${listing.condition}
- Exterior Color: ${listing.exteriorColor || 'Not specified'}
- Interior Color: ${listing.interiorColor || 'Not specified'}
- Fuel Type: ${listing.fuelType || 'Not specified'}
- Transmission: ${listing.transmission || 'Not specified'}
- Drivetrain: ${listing.drivetrain || 'Not specified'}
- Features: ${listing.features ? listing.features.join(', ') : 'None listed'}

Tone of voice: ${tone}
`;
    
    let resultContent: any = {};

    // If OpenAI key is not set, use mock responses
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not set, using mock responses");
      
      if (generateDescription) {
        resultContent.description = `Experience the exceptional ${listing.year} ${listing.make} ${listing.model}, a standout in its class with just ${listing.mileage} miles. Featuring a stunning ${listing.exteriorColor} exterior paired with a refined ${listing.interiorColor} interior, this vehicle delivers both style and substance. Equipped with a reliable ${listing.fuelType} engine and smooth ${listing.transmission} transmission, every journey promises comfort and efficiency. Don't miss the opportunity to own this meticulously maintained vehicle, complete with modern features like ${listing.features?.slice(0, 3).join(', ')} and more. Schedule your test drive today!`;
      }
      
      if (generateFeatures) {
        resultContent.highlightedFeatures = [
          `Advanced ${listing.fuelType} Engine with Optimized Efficiency`,
          `Premium ${listing.interiorColor} Interior with Refined Finishing`,
          `State-of-the-Art Technology Package including ${listing.features?.[0] || 'Modern Connectivity'}`
        ];
      }
    } else {
      // Call OpenAI API for real content generation
      if (generateDescription) {
        prompt += `\nGenerate a compelling and detailed vehicle description that highlights the key selling points. Be specific about this exact vehicle rather than generic. The description should be 100-150 words.\n`;
      }
      
      if (generateFeatures) {
        prompt += `\nGenerate 3-5 highlighted feature points that make this vehicle stand out. Each should be 5-10 words and focus on the most appealing aspects.\n`;
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert automotive copywriter who specializes in creating compelling vehicle descriptions and highlighting key features for car dealerships."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const generatedContent = completion.choices[0]?.message?.content || '';
      
      if (generateDescription && generateFeatures) {
        // Split the response into description and features
        const parts = generatedContent.split('\n\n');
        resultContent.description = parts[0] || '';
        resultContent.highlightedFeatures = parts[1]
          ? parts[1]
              .split('\n')
              .map(line => line.replace(/^- /, ''))
              .filter(line => line.trim().length > 0)
          : [];
      } else if (generateDescription) {
        resultContent.description = generatedContent;
      } else if (generateFeatures) {
        resultContent.highlightedFeatures = generatedContent
          .split('\n')
          .map(line => line.replace(/^- /, ''))
          .filter(line => line.trim().length > 0);
      }
    }
    
    return NextResponse.json({
      success: true,
      content: resultContent
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 