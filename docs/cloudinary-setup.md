# Cloudinary Integration Setup

This document explains how to set up Cloudinary integration for generative background replacement in CarDealerAI.

## Prerequisites

- A Cloudinary account (https://cloudinary.com/users/register/free)
- Vercel account for production deployment (https://vercel.com/signup)

## Environment Variables

Add the following environment variables to your `.env.local` file for local development and to your Vercel project settings for production:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_WEBHOOK_URL=https://your-domain.com/api/cloudinary/webhook
```

## Cloudinary Dashboard Setup

1. Log in to your Cloudinary account
2. Go to Settings > Upload
3. Set up the following:
   - Enable auto-tagging
   - Enable AI background removal
   - Enable AI content analysis
   - Create an upload preset with these settings

## Setting Up Webhooks (For Production)

Webhooks allow your application to receive notifications when Cloudinary finishes processing images.

1. In your Cloudinary dashboard, go to Settings > Notifications
2. Click "Add notification endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/cloudinary/webhook`
4. Select the events to subscribe to:
   - `resource.created`
   - `resource.updated`
   - `resource.transformation-succeeded`
   - `resource.transformation-failed`
5. Save the webhook configuration
6. Note the signing secret provided by Cloudinary

## Vercel Setup

For optimal performance with Cloudinary's generative AI features:

1. Upgrade to Vercel Pro to increase function execution time limits
2. Enable long-running serverless functions in your project settings
3. Add all the environment variables from above to your Vercel project

## Testing Your Integration

1. After setting up all credentials, run your development server
2. Upload an image through the CarDealerAI interface
3. Try to apply generative background replacement
4. Check your logs to ensure the API calls are working correctly

## Troubleshooting

- **Webhook not receiving events**: Ensure your production URL is correctly set up and the webhook is properly configured in Cloudinary
- **Timeout errors**: Check your Vercel function timeout settings
- **Authentication errors**: Verify your Cloudinary credentials are correct
- **CORS issues**: Ensure your Cloudinary account has CORS properly configured for your domains

For more information, refer to the [Cloudinary API Documentation](https://cloudinary.com/documentation/image_transformations). 