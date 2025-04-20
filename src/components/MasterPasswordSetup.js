'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserKey } from '@/lib/supabase';
import {
  generateSalt,
  deriveKeyFromPassword,
  createVerificationBlob,
  setDerivedKey,
} from '@/lib/encryption';

export default function MasterPasswordSetup({ userId }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to calculate password strength
  const evaluatePasswordStrength = (pass) => {
    // Simple password strength evaluation
    let strength = 0;

    if (pass.length >= 8) strength += 1;
    if (pass.length >= 12) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    evaluatePasswordStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordStrength < 3) {
      setError(
        'Please use a stronger password (mix of uppercase, lowercase, numbers, symbols)',
      );
      return;
    }

    setIsLoading(true);

    try {
      // Generate a new salt
      const salt = generateSalt();

      // Derive key from password
      const derivedKey = await deriveKeyFromPassword(password, salt);

      // Create verification blob
      const verification = await createVerificationBlob(derivedKey);

      // Save salt and verification blob to Supabase
      await saveUserKey(userId, salt, verification);

      // Store the derived key in memory
      setDerivedKey(derivedKey);

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
      setError('An error occurred during setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Moderate';
    return 'Strong';
  };

  if (!isClient) {
    return null; // Return nothing during SSR
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="masterPassword">Choose Master Password</label>
          <input
            id="masterPassword"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
            placeholder="Choose a strong master password"
            minLength={8}
          />
          {password && (
            <div>
              <p>Password Strength: {getStrengthLabel()}</p>
              <div>
                <div
                  style={{ width: `${(passwordStrength / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Master Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your master password"
          />
        </div>

        {error && <p>{error}</p>}

        <div>
          <p>
            <strong>Important:</strong> Your master password cannot be recovered
            if forgotten. Make sure to remember it or store it in a secure
            location.
          </p>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Setting up...' : 'Set Master Password'}
        </button>
      </form>
    </div>
  );
}
