import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the stripe_customer_id from the database
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();
    
    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User does not have a subscription' },
        { status: 400 }
      );
    }
    
    // Create a billing portal session
    const portalSession = await createPortalSession({
      customerId: userData.stripe_customer_id,
      returnUrl: `${request.nextUrl.origin}/dashboard/subscription`,
    });
    
    // Return the portal URL
    return NextResponse.json({ url: portalSession.url });
    
  } catch (error: any) {
    console.error('Error creating billing portal session:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
} 