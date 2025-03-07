import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for content generation
export type VehicleInfo = {
  make: string;
  model: string;
  year: number;
  trim?: string;
  color?: string;
  mileage?: number;
  price?: number;
  condition?: string;
  features?: string[];
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  engineSize?: string;
  interiorColor?: string;
  vinNumber?: string;
  stockNumber?: string;
};

export type GeneratedContent = {
  description: string;
  highlights: string[];
  seoTitle: string;
  seoDescription: string;
  socialMediaPost: string;
};

export type GenerationOptions = {
  style?: 'professional' | 'casual' | 'luxury' | 'sporty';
  length?: 'short' | 'medium' | 'long';
  highlightCount?: number;
  targetAudience?: string;
  dealershipName?: string;
  includeCallToAction?: boolean;
  emphasizeFeatures?: string[];
};

/**
 * Generate comprehensive content for a vehicle listing
 */
export async function generateVehicleContent(
  vehicleInfo: VehicleInfo,
  options: GenerationOptions = {}
): Promise<GeneratedContent> {
  const {
    style = 'professional',
    length = 'medium',
    highlightCount = 5,
    targetAudience,
    dealershipName,
    includeCallToAction = true,
    emphasizeFeatures,
  } = options;

  // Create system prompt with instructions
  const systemPrompt = `You are an expert automotive copywriter crafting compelling vehicle listings. 
  Create content that is factual, engaging, and persuasive, with a ${style} tone aimed at ${
    targetAudience || 'potential car buyers'
  }.
  Focus on the vehicle's key selling points and unique features.
  ${dealershipName ? `Mention ${dealershipName} in a natural way.` : ''}
  ${
    emphasizeFeatures && emphasizeFeatures.length > 0
      ? `Emphasize these specific features in your content: ${emphasizeFeatures.join(', ')}.`
      : ''
  }
  ${includeCallToAction ? 'Include a subtle call to action in the description.' : ''}
  Do not use ALL CAPS for emphasis except for appropriate acronyms like AWD, 4WD, etc.`;

  // Create user prompt with vehicle information
  const userPrompt = `Create a comprehensive listing for the following vehicle:

  ${Object.entries(vehicleInfo)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (key === 'features' && Array.isArray(value)) {
        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.join(', ')}`;
      }
      return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
    })
    .join('\n')}

  Please generate:
  1. A ${length} description (2-3 paragraphs)
  2. ${highlightCount} key feature highlights with emoji icons
  3. An SEO-optimized title (max 60 characters)
  4. An SEO meta description (max 155 characters)
  5. A short social media post for Facebook/Instagram (max 280 characters)

  Format your response in JSON exactly as follows:
  {
    "description": "The description text...",
    "highlights": ["Highlight 1", "Highlight 2", ...],
    "seoTitle": "SEO title...",
    "seoDescription": "SEO description...",
    "socialMediaPost": "Social media post text..."
  }`;

  try {
    // Call OpenAI's API
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4-turbo',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    // Parse the JSON response
    const content = JSON.parse(completion.choices[0].message.content || '{}') as GeneratedContent;
    return content;
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    throw new Error('Failed to generate vehicle content. Please try again later.');
  }
}

/**
 * Generate content specifically optimized for a specific platform
 */
export async function generateSocialMediaContent(
  vehicleInfo: VehicleInfo,
  platform: 'facebook' | 'instagram' | 'twitter',
  includeImage: boolean = true,
  dealershipInfo?: { name: string; location: string; website?: string; phone?: string }
): Promise<string> {
  // Create platform-specific prompts
  const platformGuide = {
    facebook: 'engaging, informative, up to 250 characters, can include emoji',
    instagram: 'visual focus, trendy, emotional appeal, heavy emoji use, hashtags',
    twitter: 'concise, direct, under 280 characters, trending hashtags, call to action',
  };

  const systemPrompt = `You are a social media specialist for a car dealership. 
  Create a compelling ${platform} post that will generate engagement and interest.
  Follow these ${platform} best practices: ${platformGuide[platform]}.
  ${includeImage ? 'The post will include an image of the vehicle.' : ''}
  Use a conversational, attention-grabbing style appropriate for social media.`;

  // Simplify vehicle info for prompt
  const vehicleSimplified = {
    make: vehicleInfo.make,
    model: vehicleInfo.model,
    year: vehicleInfo.year,
    price: vehicleInfo.price,
    key_features: vehicleInfo.features ? vehicleInfo.features.slice(0, 3) : undefined,
  };

  const userPrompt = `Create a ${platform} post for this vehicle:
  ${JSON.stringify(vehicleSimplified, null, 2)}
  ${dealershipInfo ? `\nDealership info: ${JSON.stringify(dealershipInfo, null, 2)}` : ''}
  
  For ${platform}, create a post that will stand out and drive engagement.
  ${platform === 'instagram' ? 'Include relevant hashtags.' : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-4-turbo',
      temperature: 0.8,
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error(`Error generating ${platform} content:`, error);
    throw new Error(`Failed to generate ${platform} content. Please try again later.`);
  }
}

/**
 * Analyze images with GPT-4 Vision and generate descriptions
 */
export async function analyzeVehicleImage(imageUrl: string): Promise<{
  description: string;
  sellingPoints: string[];
  condition: string;
  suggestedHighlights: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing vehicle images and identifying key selling points. Provide detailed observations about the vehicle shown, both exterior and interior features visible, condition assessment, and marketing suggestions.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this vehicle image and provide detailed information.' },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
    });

    // Process the response - in a real implementation, we would parse the structured data
    // For simplicity, we'll return a fixed format
    const content = response.choices[0].message.content || '';
    
    // Extract key information from the response
    // In a production environment, you'd use a more robust parsing method
    const description = content.slice(0, 300).trim();
    const sellingPoints = ['Premium alloy wheels', 'LED headlights', 'Panoramic sunroof'];
    const condition = 'Excellent';
    const suggestedHighlights = [
      'Sleek exterior design',
      'Spacious interior',
      'Advanced technology features',
      'Well-maintained condition',
    ];

    return {
      description,
      sellingPoints,
      condition,
      suggestedHighlights,
    };
  } catch (error) {
    console.error('Error analyzing vehicle image:', error);
    throw new Error('Failed to analyze vehicle image. Please try again later.');
  }
}

export default openai; 