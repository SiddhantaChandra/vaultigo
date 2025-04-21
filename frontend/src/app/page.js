'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import {
  getAnonymousId,
  createAnonymousSession,
  getUserKey,
} from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function checkExistingUser() {
      try {
        let userIdentifier = getAnonymousId();

        if (!userIdentifier) {
          userIdentifier = await createAnonymousSession();
        }

        setUserId(userIdentifier);

        const userKey = await getUserKey(userIdentifier);

        if (userKey) {
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsLoading(false);
      }
    }

    if (isClient) {
      checkExistingUser();
    }
  }, [isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-dark-elevated rounded-full flex items-center justify-center relative">
            <div className="animate-spin absolute">
              <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-purple-500"></div>
            </div>
            <div className="h-6 w-6 rounded-full bg-dark-background"></div>
          </div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-6">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full bg-dark-elevated border border-dark-border mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-gradient flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
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
        <h1 className="text-2xl font-bold mb-2">Welcome to Vaultigo</h1>
        <p className="text-text-secondary">
          Your secure, client-side encrypted password manager
        </p>
      </div>

      {isNewUser ? (
        <div>
          <div className="card-header">
            <h2 className="text-xl font-medium text-text-primary">
              Set Up Your Master Password
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              First, create a strong master password to secure all your
              passwords.
            </p>
          </div>
          <MasterPasswordSetup userId={userId} />
        </div>
      ) : (
        <div>
          <div className="card-header">
            <h2 className="text-xl font-medium text-text-primary">
              Unlock Your Vault
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your master password to access your passwords.
            </p>
          </div>
          <LoginForm userId={userId} />
        </div>
      )}
    </div>
  );
}
