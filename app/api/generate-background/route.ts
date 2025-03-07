import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate background image with DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a high-quality background image for a car dealership photo: ${prompt}. The image should be suitable for compositing a car in the foreground.`,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      style: "natural"
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Upload to Cloudinary for easier manipulation
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: 'generated-backgrounds',
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error) {
    console.error('Background generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate background' },
      { status: 500 }
    );
  }
} 