import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  // Return masked values for security
  return NextResponse.json({
    hasStripeKey,
    hasWebhookSecret,
    nextAuthUrl: nextAuthUrl ? `${nextAuthUrl.substring(0, 8)}...` : null,
    nodeEnv: process.env.NODE_ENV,
  });
} 