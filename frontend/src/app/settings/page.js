'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getAnonymousId } from '@/lib/supabase';
import { getDerivedKey, clearDerivedKey } from '@/lib/encryption';

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const userIdentifier = getAnonymousId();
    const derivedKey = getDerivedKey();

    if (userIdentifier && derivedKey) {
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

  const handleLogout = () => {
    clearDerivedKey();
    router.push('/');
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This will permanently remove all your saved passwords and cannot be undone.',
      )
    ) {
      // In a real implementation, we would call an API to delete the account data
      // For now, we'll just log out
      clearDerivedKey();
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vaultigo_anonymous_id');
      }

      alert('Your account has been deleted.');
      router.push('/');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div>
      <Navigation />

      <div>
        <h1>Settings</h1>

        <section>
          <h2>Account</h2>
          <p>
            User ID: {userId ? userId.substring(0, 8) + '...' : 'Not logged in'}
          </p>

          <div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </section>

        <section>
          <h2>Security</h2>
          <div>
            <h3>Change Master Password</h3>
            <p>
              Changing your master password will re-encrypt all your stored
              passwords.
            </p>
            <button
              onClick={() => alert('This feature is not yet implemented.')}
            >
              Change Master Password
            </button>
          </div>
        </section>

        <section>
          <h2>Data</h2>
          <div>
            <h3>Export Passwords</h3>
            <p>Export your passwords as an encrypted file.</p>
            <button
              onClick={() => alert('This feature is not yet implemented.')}
            >
              Export Data
            </button>
          </div>

          <div>
            <h3>Import Passwords</h3>
            <p>Import passwords from a file or another password manager.</p>
            <button
              onClick={() => alert('This feature is not yet implemented.')}
            >
              Import Data
            </button>
          </div>
        </section>

        <section>
          <h2>Danger Zone</h2>
          <div>
            <h3>Delete Account</h3>
            <p>
              This will permanently delete all your saved passwords and account
              data.
            </p>
            <button onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </section>
      </div>
    </div>
  );
}
