import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

// Function to verify Cloudinary webhook signature
function verifyCloudinaryWebhook(signature: string, timestamp: string, body: string): boolean {
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error('CLOUDINARY_API_SECRET is not defined');
    return false;
  }

  // Create the expected signature
  const expectedSignature = createHmac('sha1', process.env.CLOUDINARY_API_SECRET)
    .update(body + timestamp)
    .digest('hex');

  // Compare with the provided signature
  return signature === expectedSignature;
}

export async function POST(request: Request) {
  try {
    // Get the raw body data
    const body = await request.text();
    const timestamp = request.headers.get('x-cld-timestamp') || '';
    const signature = request.headers.get('x-cld-signature') || '';

    // Log webhook receipt
    console.log('Cloudinary webhook received:', {
      timestamp,
      hasSignature: !!signature,
      bodyLength: body.length
    });

    // Verify the webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      const isValid = verifyCloudinaryWebhook(signature, timestamp, body);
      if (!isValid) {
        console.error('Invalid Cloudinary webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Parse the body
    const data = JSON.parse(body);
    
    // Log the notification type
    console.log('Cloudinary notification type:', data.notification_type);

    // Handle different notification types
    switch (data.notification_type) {
      case 'upload':
        await handleUploadNotification(data);
        break;
      case 'generation':
        await handleGenerationNotification(data);
        break;
      case 'error':
        await handleErrorNotification(data);
        break;
      default:
        console.log('Unhandled notification type:', data.notification_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Cloudinary webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleUploadNotification(data: any) {
  // Process upload notification
  // Update database or trigger further actions
  console.log('Upload completed:', data.public_id);
  
  // Here you would update your database to mark the image as processed
  // or trigger additional processing steps
}

async function handleGenerationNotification(data: any) {
  // Process generation completion notification
  console.log('Generation completed:', data.public_id);
  
  // For generative fills or backgrounds, you would:
  // 1. Update the listing with the new image URL
  // 2. Notify any waiting clients that processing is complete
  // 3. Store the result in your database
}

async function handleErrorNotification(data: any) {
  // Process error notification
  console.error('Cloudinary processing error:', {
    public_id: data.public_id,
    error: data.error,
    message: data.message
  });
  
  // Update your database to mark the job as failed
  // Optionally trigger retry or fallback logic
} 