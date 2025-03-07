import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = headers().get('stripe-signature') as string;
  
  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }
  
  try {
    // Verify the event came from Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Get admin supabase client for database operations
    const supabase = createAdminClient();
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Extract the metadata from the checkout session
        const { userId, dealershipId } = session.metadata;
        
        // Retrieve customer details
        const customer = await stripe.customers.retrieve(session.customer);
        
        // Update the user and dealership with subscription details
        await supabase.from('users').update({
          stripe_customer_id: session.customer,
          subscription_status: 'active',
        }).eq('id', userId);
        
        if (dealershipId && dealershipId !== 'no_dealership') {
          // Get the subscription tier based on the price ID
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0].price.id;
          
          // Determine the subscription tier
          let subscriptionTier: string | null = null;
          if (priceId === 'price_pro') {
            subscriptionTier = 'pro';
          } else if (priceId === 'price_growth') {
            subscriptionTier = 'growth';
          } else if (priceId === 'price_enterprise') {
            subscriptionTier = 'enterprise';
          }
          
          // Update the dealership record
          if (subscriptionTier) {
            await supabase.from('dealerships').update({
              subscription_tier: subscriptionTier,
              stripe_subscription_id: session.subscription,
            }).eq('id', dealershipId);
          }
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        // Update the subscription status in the database
        await supabase.from('dealerships')
          .update({
            subscription_status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Update the subscription status in the database
        await supabase.from('dealerships')
          .update({
            subscription_status: 'canceled',
            subscription_tier: null,
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }
      
      // Add more event handlers as needed
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }
} 