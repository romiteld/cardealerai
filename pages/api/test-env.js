// Simple API to test if Cloudinary environment variables are loading correctly

export default function handler(req, res) {
  res.status(200).json({
    cloudinaryConfigured: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set',
      cloudinaryUrl: process.env.CLOUDINARY_URL ? 'Set' : 'Not set',
    }
  });
} 