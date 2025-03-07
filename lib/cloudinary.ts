import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: any[];
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  allowed_formats?: string[];
  overwrite?: boolean;
}

/**
 * Uploads an image to Cloudinary with optimized settings
 */
export async function optimizedUpload(
  source: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const defaultOptions = {
    resource_type: 'auto' as const,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    overwrite: true,
  };

  const uploadOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(source, uploadOptions);
    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Formats the image transformation parameters for the specified settings
 */
export function formatTransformation(settings: any) {
  const transformation = [];
  
  if (settings.brightness !== 0) {
    transformation.push({ brightness: settings.brightness });
  }
  if (settings.contrast !== 0) {
    transformation.push({ contrast: settings.contrast });
  }
  if (settings.saturation !== 0) {
    transformation.push({ saturation: settings.saturation });
  }
  if (settings.blur > 0) {
    transformation.push({ blur: settings.blur });
  }
  if (settings.sharpen > 0) {
    transformation.push({ sharpen: settings.sharpen });
  }
  if (settings.effect && settings.effect !== 'none') {
    switch (settings.effect) {
      case 'art_audrey':
        transformation.push({ effect: 'grayscale' });
        transformation.push({ brightness: 30 });
        transformation.push({ contrast: 50 });
        break;
      case 'art_zorro':
        transformation.push({ effect: 'grayscale' });
        transformation.push({ contrast: 50 });
        break;
      case 'cartoonify':
        transformation.push({ effect: 'cartoonify' });
        break;
      case 'vignette':
        transformation.push({ effect: 'vignette:30' });
        break;
      case 'oil_paint':
        transformation.push({ effect: 'art:oil_paint' });
        break;
    }
  }
  
  return transformation;
}

export interface ImageEnhancement {
  effect?: string;
  quality?: string | number;
  color?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  effect?: string;
  background_removal?: string;
  [key: string]: string | number | undefined;
}

/**
 * Uploads an image to Cloudinary
 */
export async function uploadImage(
  file: File,
  options: { folder?: string; transformation?: CloudinaryTransformation[] } = {}
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.transformation) {
    formData.append('transformation', JSON.stringify(options.transformation));
  }
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Deletes an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
} 