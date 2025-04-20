'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserKey } from '@/lib/supabase';
import {
  deriveKeyFromPassword,
  verifyMasterPassword,
  setDerivedKey,
  initArgon2,
} from '@/lib/encryption';

export default function LoginForm({ userId }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isArgon2Ready, setIsArgon2Ready] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function prepareArgon2() {
      try {
        const initialized = await initArgon2();
        setIsArgon2Ready(initialized);
        if (!initialized) {
          setError(
            'Failed to initialize encryption library. Please refresh the page.',
          );
        }
      } catch (err) {
        console.error('Failed to initialize Argon2:', err);
        setError(
          'Failed to initialize encryption library. Please refresh the page.',
        );
      }
    }

    if (typeof window !== 'undefined') {
      prepareArgon2();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isArgon2Ready) {
      setError('Encryption library is not ready. Please refresh the page.');
      return;
    }

    setIsLoading(true);

    try {
      // Get user's salt and verification blob from Supabase
      const userKey = await getUserKey(userId);

      if (!userKey) {
        setError('User not found. Please set up a master password first.');
        setIsLoading(false);
        return;
      }

      const { salt, verification } = userKey;

      // Derive key from password using the stored salt
      const derivedKey = await deriveKeyFromPassword(password, salt);

      // Verify the master password
      const isValid = verifyMasterPassword(derivedKey, verification);

      if (isValid) {
        // If valid, store the derived key in memory
        setDerivedKey(derivedKey);

        // Navigate to dashboard
        router.push('/dashboard');
      } else {
        setError('Incorrect master password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null; // Return nothing during SSR
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="masterPassword">Master Password</label>
          <input
            id="masterPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your master password"
            minLength={8}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isLoading || !isArgon2Ready}>
          {isLoading ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
