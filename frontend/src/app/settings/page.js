'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImportExportPasswords from '@/components/ImportExportPasswords';
import BreachCheck from '@/components/BreachCheck';
import { getAnonymousId } from '@/lib/supabase';
import { getDerivedKey, clearDerivedKey } from '@/lib/encryption';

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('account');

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

        {/* Tab Navigation */}
        <div>
          <button
            onClick={() => setActiveTab('account')}
            disabled={activeTab === 'account'}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('security')}
            disabled={activeTab === 'security'}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            disabled={activeTab === 'import-export'}
          >
            Import & Export
          </button>
          <button
            onClick={() => setActiveTab('breach-check')}
            disabled={activeTab === 'breach-check'}
          >
            Breach Check
          </button>
          <button
            onClick={() => setActiveTab('danger-zone')}
            disabled={activeTab === 'danger-zone'}
          >
            Danger Zone
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <section>
            <h2>Account</h2>
            <p>
              User ID:{' '}
              {userId ? userId.substring(0, 8) + '...' : 'Not logged in'}
            </p>

            <div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </section>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
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

            <div>
              <h3>Password Generator Settings</h3>
              <p>
                Customize how passwords are generated when using the password
                generator.
              </p>
              <button
                onClick={() => alert('This feature is not yet implemented.')}
              >
                Configure Generator
              </button>
            </div>
          </section>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && <ImportExportPasswords />}

        {/* Breach Check Tab */}
        {activeTab === 'breach-check' && <BreachCheck />}

        {/* Danger Zone Tab */}
        {activeTab === 'danger-zone' && (
          <section>
            <h2>Danger Zone</h2>
            <div>
              <h3>Delete Account</h3>
              <p>
                This will permanently delete all your saved passwords and
                account data. This action cannot be undone.
              </p>
              <button onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
