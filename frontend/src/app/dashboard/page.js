'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAnonymousId, getPasswordEntries } from '@/lib/supabase';
import { getDerivedKey, decryptPasswordEntry } from '@/lib/encryption';
import PasswordList from '@/components/PasswordList';
import AddPasswordForm from '@/components/AddPasswordForm';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const router = useRouter();
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function initialize() {
      if (!isClient) return;

      // Check if we have a derived key in memory
      const derivedKey = getDerivedKey();
      if (!derivedKey) {
        // Redirect to login if no derived key
        router.push('/');
        return;
      }

      // Get user ID
      const userIdentifier = getAnonymousId();
      if (!userIdentifier) {
        router.push('/');
        return;
      }

      setUserId(userIdentifier);

      await fetchPasswords(userIdentifier, derivedKey);
    }

    if (isClient) {
      initialize();
    }
  }, [router, isClient]);

  const fetchPasswords = async (userId, derivedKey) => {
    setIsLoading(true);
    try {
      // Fetch encrypted password entries from Supabase
      const encryptedEntries = await getPasswordEntries(userId);

      // Decrypt each password entry
      const decryptedPasswords = encryptedEntries.map((entry) => {
        try {
          const decrypted = decryptPasswordEntry(entry.encrypted, derivedKey);
          return {
            id: entry.id,
            website: entry.website,
            ...decrypted,
          };
        } catch (error) {
          console.error(`Failed to decrypt entry ${entry.id}:`, error);
          return {
            id: entry.id,
            website: entry.website,
            username: '(Decryption failed)',
            password: '**********',
            notes: '',
            _decryptionFailed: true,
          };
        }
      });

      setPasswords(decryptedPasswords);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      setError('Failed to load passwords. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPassword = (newPassword) => {
    setPasswords([...passwords, newPassword]);
    setShowAddForm(false);
  };

  const handleDeletePassword = (passwordId) => {
    setPasswords(passwords.filter((password) => password.id !== passwordId));
  };

  const handleLogout = () => {
    // Clear the derived key from memory
    require('../../lib/encryption').clearDerivedKey();
    // Redirect to login page
    router.push('/');
  };

  const goToImportExport = () => {
    router.push('/settings');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <Navigation />

      <div>
        <div>
          <h2>Password Vault</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {error && <p>{error}</p>}

        {isLoading ? (
          <p>Loading passwords...</p>
        ) : (
          <div>
            <div>
              <h3>Your Saved Passwords</h3>
              {passwords.length === 0 ? (
                <div>
                  <p>
                    No passwords saved yet. Add your first password below or
                    import existing passwords.
                  </p>
                  <button onClick={goToImportExport}>Import Passwords</button>
                </div>
              ) : (
                <div>
                  <PasswordList
                    passwords={passwords}
                    onDelete={handleDeletePassword}
                  />
                  <div>
                    <button onClick={goToImportExport}>
                      Import/Export Passwords
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showAddForm ? (
              <div>
                <h3>Add New Password</h3>
                <AddPasswordForm
                  onAdd={handleAddPassword}
                  onCancel={() => setShowAddForm(false)}
                  userId={userId}
                />
              </div>
            ) : (
              <button onClick={() => setShowAddForm(true)}>
                Add New Password
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
