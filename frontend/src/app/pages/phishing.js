'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import PhishingDetector from '@/components/PhishingDetector';
import { supabase } from '@/lib/supabase';

export default function PhishingPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const session = supabase.auth.session();
    setSession(session);
    setLoading(false);

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      },
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // If loading, show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, show login prompt
  if (!session) {
    return (
      <div>
        <h1>Vaultigo Password Manager</h1>
        <p>Please log in to access the phishing detection tool</p>
        {/* Add your login component here */}
      </div>
    );
  }

  // If authenticated, show the phishing detector
  return (
    <div>
      <Head>
        <title>Phishing Detector | Vaultigo</title>
        <meta name="description" content="Check emails for phishing attempts" />
      </Head>

      <main>
        <Navigation />

        <div>
          <h1>Email Phishing Detector</h1>
          <p>
            Use this tool to analyze suspicious emails for potential phishing
            attempts
          </p>

          <PhishingDetector />
        </div>
      </main>
    </div>
  );
}
