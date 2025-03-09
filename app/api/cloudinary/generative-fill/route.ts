import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Cloudinary } from '@cloudinary/url-gen';

// Debug environment variable loading
console.log('Cloudinary API route initialized');
console.log('Environment variables check:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set (value hidden)' : 'Not set');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (value hidden)' : 'Not set');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (value hidden)' : 'Not set');

// Configure Cloudinary directly from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize the URL-Gen SDK
const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  }
});

// Simple check that prints current config
console.log('Cloudinary configured with:', {
  cloud_name: cloudinary.config().cloud_name ? 'Set (value: ' + cloudinary.config().cloud_name + ')' : 'Not set',
  api_key: cloudinary.config().api_key ? 'Set (first 4 chars: ' + cloudinary.config().api_key?.substring(0, 4) + '...)' : 'Not set',
  api_secret: cloudinary.config().api_secret ? 'Set (length: ' + cloudinary.config().api_secret?.length + ')' : 'Not set'
});

export async function POST(request: Request) {
  try {
    console.log('POST request received to /api/cloudinary/generative-fill');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body received:', { 
        publicId: body.publicId,
        hasPrompt: !!body.prompt,
        removeBackground: body.removeBackground
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { publicId, prompt, removeBackground = false, seed = null } = body;
    
    if (!publicId) {
      console.error('Public ID is missing in request');
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    console.log(`Processing generative background replacement for image: ${publicId}`);
    console.log(`Prompt: ${prompt || 'none'} (seed: ${seed || 'random'})`);
    
    // First check if the image exists
    try {
      const resourceCheck = await cloudinary.api.resource(publicId);
      console.log(`Resource check passed for ${publicId}, image exists`);
    } catch (resourceError: any) {
      if (resourceError.http_code === 404) {
        console.error(`Image ${publicId} not found in Cloudinary. Verify it was uploaded first.`);
        return NextResponse.json(
          { 
            error: `Image not found in Cloudinary: ${publicId}`,
            details: {
              message: 'Please upload the image to Cloudinary first before applying transformations',
              suggestion: 'Check that the correct publicId is being used and that the image was successfully uploaded'
            }
          },
          { status: 404 }
        );
      }
      throw resourceError; // Re-throw if it's not a 404
    }
    
    // Generate a unique tag for this processing job for webhook tracking
    const jobId = `gen_bg_replace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // For background replacement with prompt
      if (prompt) {
        // Use generative background replacement
        console.log('Using generative background replacement with prompt:', prompt);
        
        // Build the transformation string for generative background replacement
        let transformationStr = `e_gen_background_replace:prompt_${prompt}`;
        
        // Add seed if specified
        if (seed) {
          transformationStr += `;seed_${seed}`;
        }
        
        // Generate the URL for preview
        const generatedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationStr}/${publicId}`;
        
        console.log('Generated URL for generative background replacement:', generatedUrl);
        
        // Use the Admin API to persist this transformation with optimized settings for background replacement
        const result = await cloudinary.uploader.explicit(publicId, {
          type: 'upload',
          eager: [{ 
            transformation: [
              { effect: transformationStr.replace('e_', '') },
              { flags: 'preserve_transparency' },
              { crop: 'scale', width: 1200 }  // Scale to larger size for better quality
            ],
            format: 'auto',
            quality: 'auto:best',
            dpr: '2.0'
          }],
          eager_async: true,
          tags: [jobId, 'generative-bg-replace', 'car-dealer-ai']
        });
        
        console.log('Cloudinary API response:', JSON.stringify(result));
        
        // If eager results are immediately available
        if (result.eager && result.eager.length > 0) {
          return NextResponse.json({
            status: 'completed',
            urls: result.eager.map((img: { secure_url: string }) => img.secure_url),
            generatedUrl: generatedUrl,
            publicId: result.public_id,
            transformation: transformationStr
          });
        }
        
        // For async processing, return a job ID and the generated URL as preview
        return NextResponse.json({
          status: 'processing',
          jobId,
          publicId,
          previewUrl: generatedUrl,
          transformation: transformationStr,
          message: 'Generative background replacement request accepted and is being processed'
        });
      } 
      // For automatic background replacement (no prompt)
      else {
        console.log('Using automatic generative background replacement (no prompt)');
        
        // Build the transformation string for generative background replacement
        let transformationStr = `e_gen_background_replace`;
        
        // Add seed if specified
        if (seed) {
          transformationStr += `;seed_${seed}`;
        }
        
        // Generate the URL for preview
        const generatedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationStr}/${publicId}`;
        
        console.log('Generated URL for automatic background replacement:', generatedUrl);
        
        // Use the explicit API to create a new derived image
        const result = await cloudinary.uploader.explicit(publicId, {
          type: 'upload',
          eager: [{ 
            transformation: [{ effect: transformationStr.replace('e_', '') }],
            format: 'auto',
            quality: 'auto:best',
            dpr: '2.0'
          }],
          eager_async: true,
          tags: [jobId, 'auto-bg-replace', 'car-dealer-ai']
        });
        
        console.log('Cloudinary API response:', JSON.stringify(result));
        
        // If eager results are immediately available
        if (result.eager && result.eager.length > 0) {
          return NextResponse.json({
            status: 'completed',
            urls: result.eager.map((img: { secure_url: string }) => img.secure_url),
            generatedUrl: generatedUrl,
            publicId: result.public_id,
            transformation: transformationStr
          });
        }
        
        // For async processing, return a job ID and the generated URL as preview
        return NextResponse.json({
          status: 'processing',
          jobId,
          publicId,
          previewUrl: generatedUrl,
          transformation: transformationStr,
          message: 'Automatic background replacement request accepted and is being processed'
        });
      }
    } catch (cloudinaryError: any) {
      console.error('Cloudinary processing error:', cloudinaryError);
      
      // Provide more detailed error info
      const errorDetails = {
        message: cloudinaryError.message || 'Unknown Cloudinary error',
        code: cloudinaryError.http_code || cloudinaryError.code || 'UNKNOWN',
        context: {
          publicId,
          prompt,
          seed,
          cloudinary_config: {
            cloud_name_set: !!cloudinary.config().cloud_name,
            api_key_set: !!cloudinary.config().api_key,
            api_secret_set: !!cloudinary.config().api_secret
          }
        }
      };
      
      console.error('Error details:', errorDetails);
      
      return NextResponse.json(
        { 
          error: 'Failed to process image with Cloudinary',
          details: errorDetails
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in generative background replacement endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: error.message },
      { status: 500 }
    );
  }
}

// Endpoint to check status of a generative fill job
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Checking status for job ID: ${jobId}`);
    
    // Extract the tag we created when submitting the job
    // The jobId should match the tag we used when creating the transformation
    try {
      // Search for resources with the specific job tag
      const result = await cloudinary.api.resources_by_tag(jobId, {
        resource_type: 'image',
        max_results: 10
      });
      
      console.log(`Found ${result.resources.length} resources with tag ${jobId}`);
      
      if (!result.resources.length) {
        // No resources found with this tag yet, job may still be processing
        return NextResponse.json({
          status: 'processing',
          jobId,
          message: 'Job is still processing. No resources found yet.'
        });
      }
      
      // Check the eager status of the resources
      const resources = result.resources;
      
      // Get the first resource details
      const resource = resources[0];
      const resourceDetails = await cloudinary.api.resource(resource.public_id, {
        resource_type: 'image',
        eager: true
      });
      
      // Check if eager transformations are completed
      if (resourceDetails.eager && resourceDetails.eager.length > 0) {
        const urls = resourceDetails.eager.map((img: { secure_url: string }) => img.secure_url);
        
        console.log(`Job ${jobId} is complete. Found ${urls.length} result URLs.`);
        
        return NextResponse.json({
          status: 'completed',
          jobId,
          urls,
          publicId: resource.public_id,
          message: 'Job completed successfully'
        });
      } else {
        // Resources found but eager transformations still processing
        return NextResponse.json({
          status: 'processing',
          jobId,
          message: 'Resources found but eager transformations still processing'
        });
      }
    } catch (error: any) {
      console.error(`Error checking job status for ${jobId}:`, error);
      
      // Don't fail immediately, the job might still be in progress
      if (error.http_code === 404) {
        return NextResponse.json({
          status: 'processing',
          jobId,
          message: 'Job is being processed. No resources found yet.'
        });
      }
      
      // For other errors, return an error response
      return NextResponse.json(
        { 
          error: 'Failed to check job status',
          message: error.message || 'Unknown error',
          jobId
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
} 