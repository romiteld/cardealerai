import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  eager?: any[];
}

export interface EnhanceSettings {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  vibrance?: number;
  preset?: string;
}

export interface UploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  allowed_formats?: string[];
  transformation?: string[];
}

export interface ImageAnalysis {
  colors: {
    predominant: string[];
    foreground: string[];
    background: string[];
  };
  faces: {
    confidence: number;
    bounding_box: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  }[];
  labels: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  quality: {
    overall: number;
    noise: number;
    focus: number;
    exposure: number;
    color: number;
  };
}

// Default transformations for optimization
const defaultTransformations = [
  { quality: 'auto:best' },
  { fetch_format: 'auto' },
  { dpr: 'auto' },
  { crop: 'limit' },
];

// Common image sizes for eager transformations
const commonSizes = [
  { width: 640, height: 480 },  // small
  { width: 1024, height: 768 }, // medium
  { width: 1920, height: 1080 }, // large
];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return withRetry(operation, retries - 1, delayMs);
    }
    throw error;
  }
}

// Main upload function with optimizations
export async function optimizedUpload(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const uploadOptions = {
    ...options,
    resource_type: options.resource_type || 'image',
    allowed_formats: options.allowed_formats || ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      ...(options.transformation || []),
      ...defaultTransformations,
    ],
    eager: commonSizes.map(size => ({
      ...size,
      crop: 'fill',
      gravity: 'auto',
    })),
    eager_async: true,
  };

  return withRetry(async () => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );

      if (typeof file === 'string') {
        // If file is a URL or base64 string
        uploadStream.end(file);
      } else {
        // If file is a Buffer
        uploadStream.end(file);
      }
    });
  });
}

// Function to apply enhancement preset
export async function applyEnhancement(
  publicId: string,
  preset: string
): Promise<string> {
  const presetTransformations = {
    auto: ['e_improve', 'e_enhance'],
    professional: ['e_enhance:50', 'e_saturation:20', 'e_contrast:10'],
    hdr: ['e_improve', 'e_contrast:30', 'e_vibrance:30'],
    dramatic: ['e_art:athena', 'e_contrast:40'],
    artistic: ['e_art:zorro'],
    portrait: ['e_improve', 'e_redeye', 'e_skin_tone'],
    product: ['e_gen_restore', 'e_enhance', 'e_improve'],
    landscape: ['e_improve', 'e_vibrance:30', 'e_saturation:20'],
    blackAndWhite: ['e_grayscale', 'e_contrast:30'],
    vintage: ['e_sepia:50', 'e_vignette'],
  }[preset.toLowerCase()] || ['e_improve'];

  return cloudinary.url(publicId, {
    transformation: presetTransformations,
    secure: true,
  });
}

// Function to apply manual enhancements
export async function applyManualEnhancements(
  publicId: string,
  settings: EnhanceSettings
): Promise<string> {
  const transformations = [];

  if (settings.brightness) transformations.push(`e_brightness:${settings.brightness}`);
  if (settings.contrast) transformations.push(`e_contrast:${settings.contrast}`);
  if (settings.saturation) transformations.push(`e_saturation:${settings.saturation}`);
  if (settings.sharpness) transformations.push(`e_sharpen:${settings.sharpness}`);
  if (settings.vibrance) transformations.push(`e_vibrance:${settings.vibrance}`);

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}

// Function to analyze an image
export async function analyzeImage(publicId: string): Promise<ImageAnalysis> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
      faces: true,
      quality_analysis: true,
      metadata: true
    });

    return {
      colors: {
        predominant: result.colors || [],
        foreground: result.predominant?.foreground || [],
        background: result.predominant?.background || []
      },
      faces: result.info?.detection?.faces || [],
      labels: result.tags || [],
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      },
      quality: {
        overall: result.quality?.overall || 0,
        noise: result.quality?.noise || 0,
        focus: result.quality?.focus || 0,
        exposure: result.quality?.exposure || 0,
        color: result.quality?.color || 0
      }
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export async function batchEnhanceImages(publicIds: string[], preset?: string): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = publicIds.map(publicId => 
    withRetry(async () => {
      return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadOptions = {
          transformation: preset ? [{ preset }] : [],
          invalidate: true
        };

        cloudinary.uploader.explicit(
          publicId,
          uploadOptions,
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );
      });
    })
  );
  
  return Promise.all(uploadPromises);
}

export const enhancementPresets = {
  auto: ['e_improve', 'e_enhance'],
  professional: ['e_enhance:50', 'e_saturation:20', 'e_contrast:10'],
  hdr: ['e_improve', 'e_contrast:30', 'e_vibrance:30'],
  dramatic: ['e_art:athena', 'e_contrast:40'],
  artistic: ['e_art:zorro'],
  portrait: ['e_improve', 'e_redeye', 'e_skin_tone'],
  product: ['e_gen_restore', 'e_enhance', 'e_improve'],
  landscape: ['e_improve', 'e_vibrance:30', 'e_saturation:20'],
  blackAndWhite: ['e_grayscale', 'e_contrast:30'],
  vintage: ['e_sepia:50', 'e_vignette'],
} as const;

export type EnhancementPreset = keyof typeof enhancementPresets;

export default { 
  enhancementPresets,
  batchEnhanceImages,
  optimizedUpload,
  applyEnhancement,
  applyManualEnhancements,
  analyzeImage
}; 