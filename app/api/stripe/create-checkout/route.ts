import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createCheckoutSession, SUBSCRIPTION_PLANS } from '@/lib/stripe';

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
    
    // Get the subscription tier from the request
    const { subscriptionTier } = await request.json();
    
    if (!subscriptionTier || !SUBSCRIPTION_PLANS[subscriptionTier as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }
    
    // Get the user data
    const { data: userData } = await supabase
      .from('users')
      .select('*, dealerships(*)')
      .eq('id', session.user.id)
      .single();
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get the price ID for the selected tier
    const priceId = SUBSCRIPTION_PLANS[subscriptionTier as keyof typeof SUBSCRIPTION_PLANS].priceId;
    
    // Create a checkout session
    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: session.user.id,
      dealershipId: userData.dealership_id || 'no_dealership',
      email: session.user.email,
      successUrl: `${request.nextUrl.origin}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${request.nextUrl.origin}/dashboard/subscription/canceled`,
    });
    
    // Return the checkout URL
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 