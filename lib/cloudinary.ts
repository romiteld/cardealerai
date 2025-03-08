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

/**
 * Process batch of images with AI background removal or replacement
 * @param imageIds Array of Cloudinary public IDs
 * @param mode 'remove' or 'replace' background
 * @param prompt Prompt for background replacement (if mode is 'replace')
 * @returns Results for each processed image
 */
export async function processBatchBackground(
  imageIds: string[],
  mode: 'remove' | 'replace' = 'remove',
  prompt: string = 'dealership showroom'
) {
  if (!imageIds || imageIds.length === 0) {
    throw new Error('No image IDs provided');
  }

  // Cache-busting timestamp
  const timestamp = new Date().getTime();
  
  // Track results
  const results = [];
  let successCount = 0;
  let failCount = 0;

  // Process each image
  for (const publicId of imageIds) {
    try {
      // Verify resource exists
      const resource = await cloudinary.api.resource(publicId);
      
      if (!resource) {
        results.push({
          originalId: publicId,
          success: false,
          error: 'Resource not found'
        });
        failCount++;
        continue;
      }
      
      // Determine transformations based on mode
      let transformations = [];
      let previewOptions: Array<Array<Record<string, any>>> = [];
      
      if (mode === 'remove') {
        // Just remove background
        transformations = [
          { width: 1200, crop: 'scale' },
          { effect: 'bgremoval' }
        ];
        
        // Different preview options (transparent, white, gradient)
        previewOptions = [
          // Transparent background
          [
            { width: 1200, crop: 'scale' },
            { effect: 'bgremoval' }
          ],
          // White background
          [
            { width: 1200, crop: 'scale' },
            { background: 'white', effect: 'bgremoval' }
          ],
          // Light gradient background
          [
            { width: 1200, crop: 'scale' },
            { background: 'linear_gradient:lightblue:white', effect: 'bgremoval' }
          ]
        ];
      } else if (mode === 'replace') {
        // Background replacement with generative fill
        // Note: Requires Cloudinary AI Background Generator
        
        // Get colors based on prompt for fallback options
        const colors = getColorsFromPrompt(prompt);
        
        // AI generative fill requires a padding crop mode
        transformations = [
          { width: 1200, height: 800, crop: 'pad', background: 'auto' },
          { effect: 'generative-fill' }
        ];
        
        // Different preview options based on prompt
        previewOptions = [
          // Generative fill
          [
            { width: 1200, height: 800, crop: 'pad', background: 'auto' },
            { effect: 'generative-fill' }
          ],
          // Solid color from prompt
          [
            { width: 1200, crop: 'scale' },
            { background: colors.primary, effect: 'bgremoval' }
          ],
          // Gradient based on prompt colors
          [
            { width: 1200, crop: 'scale' },
            { background: `linear_gradient:${colors.primary}:${colors.secondary}`, effect: 'bgremoval' }
          ]
        ];
      }
      
      // Generate preview URLs
      const previewUrls = previewOptions.map(transformationSet => {
        return cloudinary.url(publicId, {
          secure: true,
          transformation: transformationSet,
          version: timestamp
        });
      });
      
      results.push({
        originalId: publicId,
        success: true,
        previews: previewUrls
      });
      
      successCount++;
    } catch (error) {
      console.error(`Error processing image ${publicId}:`, error);
      results.push({
        originalId: publicId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failCount++;
    }
  }
  
  return {
    batchResults: results,
    successCount,
    failCount
  };
}

/**
 * Helper function to map prompts to color pairs
 */
function getColorsFromPrompt(prompt: string): { primary: string; secondary: string } {
  const prompt_lower = prompt.toLowerCase();
  
  // Map common prompt terms to color pairs
  if (prompt_lower.includes('luxury') || prompt_lower.includes('showroom')) {
    return { primary: 'darkblue', secondary: 'black' };
  }
  if (prompt_lower.includes('beach') || prompt_lower.includes('ocean') || prompt_lower.includes('sea')) {
    return { primary: 'azure', secondary: 'lightblue' };
  }
  if (prompt_lower.includes('sunset') || prompt_lower.includes('dusk')) {
    return { primary: 'orange', secondary: 'red' };
  }
  if (prompt_lower.includes('mountain') || prompt_lower.includes('hill') || prompt_lower.includes('cliff')) {
    return { primary: 'darkgreen', secondary: 'brown' };
  }
  if (prompt_lower.includes('desert') || prompt_lower.includes('sand')) {
    return { primary: 'khaki', secondary: 'sandybrown' };
  }
  if (prompt_lower.includes('night') || prompt_lower.includes('dark')) {
    return { primary: 'midnightblue', secondary: 'navy' };
  }
  if (prompt_lower.includes('snow') || prompt_lower.includes('winter')) {
    return { primary: 'aliceblue', secondary: 'white' };
  }
  if (prompt_lower.includes('city') || prompt_lower.includes('urban')) {
    return { primary: 'gray', secondary: 'darkgray' };
  }
  
  // Default elegant background
  return { primary: 'darkblue', secondary: 'black' };
}

/**
 * Apply enhancement preset to an image
 * @param publicId - The Cloudinary public ID of the image
 * @param preset - The enhancement preset to apply
 * @returns URL of the enhanced image
 */
export async function applyEnhancement(publicId: string, preset: string): Promise<string> {
  console.log(`Applying preset ${preset} to image ${publicId}`);
  
  // If Cloudinary is not configured, return a mock URL
  if (!process.env.CLOUDINARY_API_KEY || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary credentials not set, using mock URL");
    return `https://example.com/mock-enhance/${publicId}/${preset}`;
  }
  
  try {
    // Define preset transformations
    const transformations = getPresetTransformations(preset);
    
    // Generate the Cloudinary URL with transformations
    const url = cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
      version: Date.now() // Cache busting
    });
    
    console.log(`Enhanced image URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`Error applying enhancement ${preset} to ${publicId}:`, error);
    // Return original image URL on error
    return cloudinary.url(publicId, { secure: true });
  }
}

/**
 * Get the transformations for a preset
 * @param preset - The preset name
 * @returns Array of Cloudinary transformation objects
 */
function getPresetTransformations(preset: string): any[] {
  const presetMap: Record<string, any[]> = {
    'auto': [
      { quality: 'auto:best' },
      { effect: 'improve' }
    ],
    'professional': [
      { quality: 'auto:best' },
      { effect: 'enhance:50' },
      { effect: 'saturation:20' },
      { effect: 'contrast:10' }
    ],
    'hdr': [
      { effect: 'improve' },
      { effect: 'contrast:30' },
      { effect: 'vibrance:30' }
    ],
    'dramatic': [
      { effect: 'art:athena' },
      { effect: 'contrast:40' }
    ],
    'artistic': [
      { effect: 'art:zorro' }
    ],
    'portrait': [
      { effect: 'improve' },
      { effect: 'redeye' },
      { effect: 'skin_tone' }
    ],
    'product': [
      { effect: 'gen_restore' },
      { effect: 'enhance' },
      { effect: 'improve' }
    ],
    'landscape': [
      { effect: 'improve' },
      { effect: 'vibrance:30' },
      { effect: 'saturation:20' }
    ],
    'blackAndWhite': [
      { effect: 'grayscale' },
      { effect: 'contrast:30' }
    ],
    'vintage': [
      { effect: 'sepia:50' },
      { effect: 'vignette' }
    ],
    // Default to auto enhance if preset not found
    'default': [
      { quality: 'auto:best' },
      { effect: 'improve' }
    ]
  };
  
  return presetMap[preset] || presetMap['default'];
} 