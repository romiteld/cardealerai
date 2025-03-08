import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Required environment variables for Cloudinary
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

// Check if all required environment variables are set
const checkEnvironment = () => {
  const variables: Record<string, boolean> = {};
  let isConfigured = true;
  
  for (const key of requiredEnvVars) {
    const isSet = !!process.env[key];
    variables[key] = isSet;
    if (!isSet) isConfigured = false;
  }
  
  return { isConfigured, variables };
};

// Configure Cloudinary if environment variables are available
const configureCloudinary = () => {
  const { isConfigured } = checkEnvironment();
  
  if (isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return true;
  }
  
  return false;
};

// GET handler for checking environment configuration
export async function GET() {
  try {
    const envStatus = checkEnvironment();
    
    return NextResponse.json({
      ...envStatus,
      message: envStatus.isConfigured 
        ? 'Cloudinary environment variables are properly configured.' 
        : 'Some required Cloudinary environment variables are missing.'
    });
  } catch (error: any) {
    console.error('Error checking Cloudinary configuration:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check Cloudinary configuration', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST handler for testing Cloudinary integration
export async function POST() {
  try {
    // First, check and configure Cloudinary
    const isConfigured = configureCloudinary();
    
    if (!isConfigured) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary is not properly configured',
          message: 'Please set all required environment variables.'
        }, 
        { status: 400 }
      );
    }
    
    // Create a simple test image with text overlay
    const testImageUrl = cloudinary.url('sample', {
      transformation: [
        { width: 500, crop: 'scale' },
        { overlay: { font_family: 'Arial', font_size: 30, text: 'CarDealerAI Test' }},
        { flags: 'layer_apply', gravity: 'center' }
      ]
    });
    
    // Try to make an API call to verify credentials work
    const apiTest = await cloudinary.api.ping();
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary integration test successful',
      imageUrl: testImageUrl,
      details: {
        apiResponse: apiTest,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      }
    });
  } catch (error: any) {
    console.error('Error testing Cloudinary integration:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Cloudinary test failed', 
        message: error.message,
        details: {
          code: error.code || error.http_code,
          type: error.name
        }
      },
      { status: 500 }
    );
  }
} 