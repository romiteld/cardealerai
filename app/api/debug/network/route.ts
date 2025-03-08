import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const delay = searchParams.get('delay') ? parseInt(searchParams.get('delay') as string) : 0;
  
  // Add delay if requested (to test timeout issues)
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Return request information for debugging
  return NextResponse.json({
    success: true,
    message: 'Network debug endpoint',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries([...request.headers.entries()]),
    url: request.url,
    method: request.method,
    requestInfo: {
      delay: delay,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent')
    }
  }, {
    headers: {
      // Add proper CORS headers
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function OPTIONS(request: Request) {
  // Handle preflight requests for CORS
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function POST(request: Request) {
  try {
    // Try to parse JSON body, if any
    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      // No JSON body or parsing error
    }
    
    return NextResponse.json({
      success: true,
      message: 'POST request received successfully',
      timestamp: new Date().toISOString(),
      receivedBody: body,
      headers: Object.fromEntries([...request.headers.entries()])
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process POST request',
      message: error.message
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
} 