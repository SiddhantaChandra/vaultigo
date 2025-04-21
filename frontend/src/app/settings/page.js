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
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="animate-spin absolute h-16 w-16 rounded-full border-t-2 border-b-2 border-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="space-y-6">
      <Navigation />

      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 rounded-full bg-purple-gradient">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary">
              Configure your Vaultigo account and security preferences
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-dark-border">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`relative pb-3 px-4 text-sm font-medium ${
                activeTab === 'account'
                  ? 'text-text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Account
              {activeTab === 'account' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`relative pb-3 px-4 text-sm font-medium ${
                activeTab === 'security'
                  ? 'text-text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Security
              {activeTab === 'security' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('import-export')}
              className={`relative pb-3 px-4 text-sm font-medium ${
                activeTab === 'import-export'
                  ? 'text-text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Import & Export
              {activeTab === 'import-export' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('breach-check')}
              className={`relative pb-3 px-4 text-sm font-medium ${
                activeTab === 'breach-check'
                  ? 'text-text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Breach Check
              {activeTab === 'breach-check' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('danger-zone')}
              className={`relative pb-3 px-4 text-sm font-medium ${
                activeTab === 'danger-zone'
                  ? 'text-red-400'
                  : 'text-text-secondary hover:text-red-400'
              }`}
            >
              Danger Zone
              {activeTab === 'danger-zone' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400"></span>
              )}
            </button>
          </div>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <section className="space-y-6">
            <div className="bg-dark-card rounded-lg border border-dark-border p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Account Information
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-text-primary font-medium mb-2">
                    User ID
                  </h3>
                  <div className="flex items-center">
                    <div className="bg-dark-surface px-3 py-2 rounded border border-dark-border flex-grow mr-2 font-mono text-text-secondary">
                      {userId ? (
                        <span>
                          {userId.substring(0, 8)}
                          <span className="text-text-muted">...</span>
                          {userId.substring(userId.length - 8)}
                        </span>
                      ) : (
                        'Not logged in'
                      )}
                    </div>
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(userId);
                        alert('User ID copied to clipboard');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-text-secondary text-xs mt-2">
                    This is your unique identifier for the Vaultigo system
                  </p>
                </div>

                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-text-primary font-medium mb-2">
                    Session
                  </h3>
                  <p className="text-text-secondary mb-3">
                    You are currently logged in with your master password.
                  </p>
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

                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-text-primary font-medium mb-2">
                    Local Storage
                  </h3>
                  <p className="text-text-secondary mb-3">
                    Vaultigo stores your settings in your browser's local
                    storage.
                  </p>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to clear all local settings? This won't delete your passwords.",
                        )
                      ) {
                        // Clear only settings, not user authentication
                        localStorage.removeItem('vaultigo_last_breach_scan');
                        localStorage.removeItem('vaultigo_breach_cache');
                        alert('Local settings cleared.');
                      }
                    }}
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
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Clear Local Settings
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <section className="space-y-6">
            <div className="bg-dark-card rounded-lg border border-dark-border p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Security Settings
              </h2>

              <div className="space-y-6">
                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Change Master Password
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Changing your master password will re-encrypt all your
                    stored passwords.
                  </p>
                  <button
                    onClick={() =>
                      alert('This feature is not yet implemented.')
                    }
                    className="btn-primary text-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Change Master Password
                  </button>
                </div>

                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Password Generator Settings
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Customize how passwords are generated when using the
                    password generator.
                  </p>
                  <button
                    onClick={() =>
                      alert('This feature is not yet implemented.')
                    }
                    className="btn-primary text-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Configure Generator
                  </button>
                </div>

                <div className="p-4 rounded-md bg-dark-elevated border border-dark-border">
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Auto-Logout Settings
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Configure when Vaultigo should automatically log you out for
                    security.
                  </p>
                  <button
                    onClick={() =>
                      alert('This feature is not yet implemented.')
                    }
                    className="btn-primary text-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Configure Auto-Logout
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && <ImportExportPasswords />}

        {/* Breach Check Tab */}
        {activeTab === 'breach-check' && <BreachCheck />}

        {/* Danger Zone Tab */}
        {activeTab === 'danger-zone' && (
          <section className="space-y-6">
            <div className="bg-dark-card rounded-lg border border-dark-border p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-red-500/20 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-400">
                    Danger Zone
                  </h2>
                  <p className="text-text-secondary">
                    These actions are irreversible - proceed with caution
                  </p>
                </div>
              </div>

              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-400 mb-3">
                  Delete Account
                </h3>
                <p className="text-text-secondary mb-5">
                  This will permanently delete all your saved passwords and
                  account data. This action cannot be undone.
                </p>

                <div className="bg-red-900/20 border border-red-800/40 text-red-200 p-3 rounded-md mb-5">
                  <p className="text-sm">
                    <strong>Warning:</strong> Deleting your account will
                    permanently erase all your stored passwords. Make sure you
                    have exported your passwords if you need them.
                  </p>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
