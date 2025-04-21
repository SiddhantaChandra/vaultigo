// API route to proxy Have I Been Pwned API requests
// This solves CORS issues by making server-side calls

import { NextResponse } from 'next/server';

// HIBP API constants
const HIBP_API_URL = 'https://haveibeenpwned.com/api/v3';
const HIBP_API_KEY = process.env.HIBP_API_KEY || '';

export async function GET(request) {
  try {
    // Get email from query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    // Validate API key
    if (!HIBP_API_KEY) {
      // Return simulated response if no API key is available
      return NextResponse.json([], { status: 200 });
    }

    // Make request to HIBP API
    const response = await fetch(
      `${HIBP_API_URL}/breachedaccount/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'hibp-api-key': HIBP_API_KEY,
          'user-agent': 'Vaultigo-Password-Manager',
        },
      },
    );

    // Handle 404 (not found) as a valid "no breaches" response
    if (response.status === 404) {
      return NextResponse.json([], { status: 200 });
    }

    // Handle other errors
    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with status: ${response.status}` },
        { status: response.status },
      );
    }

    // Return the breach data
    const breachData = await response.json();
    return NextResponse.json(breachData, { status: 200 });
  } catch (error) {
    console.error('Error in check-email-breach API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
