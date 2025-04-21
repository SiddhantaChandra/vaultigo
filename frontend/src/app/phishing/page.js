'use client';

import { useState, useEffect } from 'react';
import PhishingDetector from '@/components/PhishingDetector';
import Navigation from '@/components/Navigation';
import { getAnonymousId } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PhishingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if user is authenticated by looking for the anonymous ID
    const userIdentifier = getAnonymousId();

    if (userIdentifier) {
      setUserId(userIdentifier);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div>
      <Navigation />

      <div>
        <h1>Vaultigo Security Tools</h1>
        <h2>Email Phishing Detector</h2>
        <p>
          Use this tool to analyze suspicious emails and identify potential
          phishing attempts. Our machine learning algorithm will scan the email
          for common phishing indicators.
        </p>

        <PhishingDetector />
      </div>
    </div>
  );
}
