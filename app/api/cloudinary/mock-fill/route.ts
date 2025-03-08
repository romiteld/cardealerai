import { NextResponse } from 'next/server';

// Mock image URLs for testing
const mockImageURLs = {
  // Simulated background removal results
  backgroundRemoved: [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyfHx8fHx8MTcwNTQ0MTYwMQ&ixlib=rb-4.0.3&q=80&w=1600',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyfHx8fHx8MTcwNTQ0MTY3NQ&ixlib=rb-4.0.3&q=80&w=1600'
  ],
  
  // Simulated generative fill with prompts
  generativeFill: {
    'luxury car showroom': [
      'https://images.unsplash.com/photo-1606664669253-81806922ce4d?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyIHNob3dyb29tfHx8fHx8MTcwNTQ0MTY3NQ&ixlib=rb-4.0.3&q=80&w=1600',
      'https://images.unsplash.com/photo-1602777924012-f8664f4ee67e?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyIHNob3dyb29tfHx8fHx8MTcwNTQ0MTcwMg&ixlib=rb-4.0.3&q=80&w=1600'
    ],
    'beach sunset': [
      'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8c3Vuc2V0IGJlYWNofHx8fHx8MTcwNTQ0MTczNA&ixlib=rb-4.0.3&q=80&w=1600',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8c3Vuc2V0IGJlYWNofHx8fHx8MTcwNTQ0MTc2Mw&ixlib=rb-4.0.3&q=80&w=1600'
    ],
    'city street': [
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2l0eSBzdHJlZXR8fHx8fHwxNzA1NDQxNzkw&ixlib=rb-4.0.3&q=80&w=1600',
      'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2l0eSBzdHJlZXR8fHx8fHwxNzA1NDQxODE4&ixlib=rb-4.0.3&q=80&w=1600'
    ],
    'default': [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyIHNob3dyb29tfHx8fHx8MTcwNTQ0MTg0Ng&ixlib=rb-4.0.3&q=80&w=1600',
      'https://images.unsplash.com/photo-1596609548086-85bbf8ddb6b9?q=80&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2FyIGRlYWxlcnNoaXB8fHx8fHwxNzA1NDQxODcz&ixlib=rb-4.0.3&q=80&w=1600'
    ]
  }
};

// Helper to get mock URLs based on request parameters
function getMockUrls(prompt: string | null, removeBackground: boolean): string[] {
  // If only removing background
  if (removeBackground && !prompt) {
    return mockImageURLs.backgroundRemoved;
  }
  
  // If using generative fill with a prompt
  if (prompt) {
    // Try to find a matching prompt category or fall back to default
    const promptKey = Object.keys(mockImageURLs.generativeFill).find(
      key => prompt.toLowerCase().includes(key.toLowerCase())
    ) || 'default';
    
    return mockImageURLs.generativeFill[promptKey as keyof typeof mockImageURLs.generativeFill];
  }
  
  // Default case - just return something
  return mockImageURLs.generativeFill.default;
}

export async function POST(request: Request) {
  try {
    console.log('POST request received to /api/cloudinary/mock-fill');
    
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
    
    const { publicId, prompt, removeBackground = false } = body;
    
    if (!publicId) {
      console.error('Public ID is missing in request');
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    console.log(`Processing mock generative fill for image: ${publicId}`);
    console.log(`Prompt: ${prompt || 'none'}`);
    
    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get mock URLs for the response
    const mockUrls = getMockUrls(prompt, removeBackground);
    
    // Randomly decide whether to return immediate results or async job
    const isAsync = Math.random() > 0.7; // 30% chance of async response
    
    if (isAsync) {
      // Mock an async job response
      const jobId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return NextResponse.json({
        status: 'processing',
        jobId,
        publicId,
        message: 'Mock processing job started. This is a simulation.'
      });
    } else {
      // Return immediate results
      return NextResponse.json({
        status: 'completed',
        urls: mockUrls,
        publicId,
        transformations: [
          removeBackground ? { background_removal: 'mock_ai' } : null,
          prompt ? { effect: 'generative_fill', prompt } : null
        ].filter(Boolean),
        message: 'This is a mock response with placeholder images from Unsplash.'
      });
    }
  } catch (error: any) {
    console.error('Error in mock generative fill endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', message: error.message },
      { status: 500 }
    );
  }
}

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
    
    console.log(`Mock job status check for job ID: ${jobId}`);
    
    // Simulate 50% chance that job is completed
    const isCompleted = Math.random() > 0.5;
    
    if (isCompleted) {
      // Get some random mock URLs
      const promptTypes = Object.keys(mockImageURLs.generativeFill);
      const randomPromptType = promptTypes[Math.floor(Math.random() * promptTypes.length)];
      const mockUrls = mockImageURLs.generativeFill[randomPromptType as keyof typeof mockImageURLs.generativeFill];
      
      return NextResponse.json({
        status: 'completed',
        jobId,
        urls: mockUrls,
        message: 'Mock job completed successfully. This is a simulation.'
      });
    } else {
      return NextResponse.json({
        status: 'processing',
        jobId,
        message: 'Mock job is still processing. This is a simulation.'
      });
    }
  } catch (error: any) {
    console.error('Error checking mock job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status', message: error.message },
      { status: 500 }
    );
  }
} 