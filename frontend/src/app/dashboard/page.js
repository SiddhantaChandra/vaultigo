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

      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Password Vault
          </h1>
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 1H3zm0 12V5h6v4h4v6H3z"
                clipRule="evenodd"
              />
              <path d="M14 4a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1z" />
            </svg>
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12">
                <div className="animate-spin absolute h-12 w-12 rounded-full border-t-2 border-b-2 border-purple-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-text-secondary">Loading passwords...</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-text-primary">
                  Your Saved Passwords
                </h2>
                {passwords.length > 0 && (
                  <span className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs font-medium rounded-full">
                    {passwords.length}{' '}
                    {passwords.length === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </div>

              {passwords.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-dark-elevated border border-dark-border mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg text-text-primary mb-2">
                    No passwords saved yet
                  </p>
                  <p className="text-text-secondary mb-6">
                    Add your first password below or import existing passwords.
                  </p>
                  <button
                    onClick={goToImportExport}
                    className="btn-secondary text-sm inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Import Passwords
                  </button>
                </div>
              ) : (
                <div>
                  <PasswordList
                    passwords={passwords}
                    onDelete={handleDeletePassword}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={goToImportExport}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Import/Export
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showAddForm ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-medium text-text-primary">
                    Add New Password
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-text-secondary hover:text-text-primary"
                    aria-label="Close form"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <AddPasswordForm
                  onAdd={handleAddPassword}
                  onCancel={() => setShowAddForm(false)}
                  userId={userId}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary w-full flex justify-center items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New Password
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
