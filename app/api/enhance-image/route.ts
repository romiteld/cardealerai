import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'car-images',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResult);
            }
          }
        );

        uploadStream.end(buffer);
      });

      return NextResponse.json({
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      });
    } else {
      // Handle image enhancement
      const { imageUrl, settings } = await request.json();
      const transformations = [];

      if (settings.brightness !== 0) {
        transformations.push({ brightness: settings.brightness });
      }
      if (settings.contrast !== 0) {
        transformations.push({ contrast: settings.contrast });
      }
      if (settings.saturation !== 0) {
        transformations.push({ saturation: settings.saturation });
      }
      if (settings.blur > 0) {
        transformations.push({ blur: settings.blur });
      }
      if (settings.sharpen > 0) {
        transformations.push({ sharpen: settings.sharpen });
      }
      if (settings.effect && settings.effect !== 'none') {
        transformations.push({ effect: settings.effect });
      }

      const result = await cloudinary.uploader.upload(imageUrl, {
        transformation: transformations,
        folder: 'enhanced-images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      }) as CloudinaryUploadResult;

      return NextResponse.json({
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!process.env.CLOUDINARY_UPLOAD_PRESET) {
    console.error('CLOUDINARY_UPLOAD_PRESET is not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload promise
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'car-dealer-ai',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { quality: 'auto:best', fetch_format: 'auto' }
          ],
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            reject(error);
            return;
          }
          console.log('Upload success:', result);
          resolve(result);
        }
      );

      // Write buffer to stream
      uploadStream.end(buffer);
    });

    const result = await uploadPromise;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 