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
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold">Welcome to Vaultigo</h2>
        <p>Your secure, client-side encrypted password manager</p>

        {isNewUser ? (
          <div>
            <h3>Set Up Your Master Password</h3>
            <p>
              First, create a strong master password to secure all your
              passwords.
            </p>
            <MasterPasswordSetup userId={userId} />
          </div>
        ) : (
          <div>
            <h3>Unlock Your Vault</h3>
            <p>Enter your master password to access your passwords.</p>
            <LoginForm userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}
