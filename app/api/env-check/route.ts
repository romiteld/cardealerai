import { NextResponse } from 'next/server';

export async function GET() {
  // Log the environment variables to the server console
  console.log('Environment Variable Check:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set (value hidden)' : 'Not set');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (value hidden)' : 'Not set');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (value hidden)' : 'Not set');
  
  // Return a sanitized version (don't expose actual values)
  return NextResponse.json({
    environment: {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      NODE_ENV: process.env.NODE_ENV
    },
    message: 'Check server logs for full environment variable debug information'
  });
} 