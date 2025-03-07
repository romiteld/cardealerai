import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { pipeline } from 'stream/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { foregroundUrl, backgroundUrl } = await request.json();

    if (!foregroundUrl || !backgroundUrl) {
      return NextResponse.json(
        { error: 'Both foreground and background URLs are required' },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download images
    const [fgResponse, bgResponse] = await Promise.all([
      fetch(foregroundUrl),
      fetch(backgroundUrl)
    ]);

    if (!fgResponse.ok || !bgResponse.ok) {
      throw new Error('Failed to fetch images');
    }

    const fgPath = path.join(tempDir, 'foreground.png');
    const bgPath = path.join(tempDir, 'background.png');
    const outputPath = path.join(tempDir, 'composite.png');

    await Promise.all([
      pipeline(fgResponse.body!, fs.createWriteStream(fgPath)),
      pipeline(bgResponse.body!, fs.createWriteStream(bgPath))
    ]);

    // Composite images using Sharp
    await sharp(bgPath)
      .composite([
        {
          input: fgPath,
          blend: 'over'
        }
      ])
      .toFile(outputPath);

    // Upload result to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: 'composited-images',
    });

    // Clean up temp files
    fs.unlinkSync(fgPath);
    fs.unlinkSync(bgPath);
    fs.unlinkSync(outputPath);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Image compositing error:', error);
    return NextResponse.json(
      { error: 'Failed to composite images' },
      { status: 500 }
    );
  }
} 