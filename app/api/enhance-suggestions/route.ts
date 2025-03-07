import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import cloudinary from 'cloudinary';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    // Get image analysis from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and suggest specific enhancements to improve its quality. Focus on aspects like lighting, color balance, contrast, and composition. Provide suggestions in a structured format with specific Cloudinary transformation parameters.",
            },
            {
              type: "image_url",
              image_url: imageUrl,
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // Parse the suggestions and map them to Cloudinary transformations
    const suggestions = response.choices[0].message.content || 'No suggestions available';
    
    // Generate preview URLs with suggested enhancements
    const previewUrls = await generatePreviews(imageUrl, suggestions);

    return NextResponse.json({
      suggestions,
      previewUrls,
    });
  } catch (error) {
    console.error('Error generating enhancement suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate enhancement suggestions' },
      { status: 500 }
    );
  }
}

async function generatePreviews(imageUrl: string, suggestions: string) {
  try {
    // Extract the public ID from the URL
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];

    // Define common enhancement combinations based on the suggestions
    const presets = [
      {
        name: 'Balanced',
        transformations: ['e_auto_contrast', 'e_auto_color', 'e_improve'],
      },
      {
        name: 'Vibrant',
        transformations: ['e_vibrance:50', 'e_saturation:20', 'e_auto_contrast'],
      },
      {
        name: 'Sharp',
        transformations: ['e_sharpen:100', 'e_improve', 'e_auto_contrast'],
      },
      {
        name: 'Soft',
        transformations: ['e_improve', 'e_auto_brightness', 'e_saturation:-10'],
      },
    ];

    // Generate preview URLs for each preset
    const previewUrls = presets.map(preset => {
      const transformation = preset.transformations.join(',');
      return {
        name: preset.name,
        url: cloudinary.v2.url(publicId, {
          transformation: transformation,
          secure: true,
        }),
      };
    });

    return previewUrls;
  } catch (error) {
    console.error('Error generating preview URLs:', error);
    return [];
  }
} 