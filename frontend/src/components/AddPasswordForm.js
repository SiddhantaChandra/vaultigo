'use client';

import { useState, useEffect } from 'react';
import { savePasswordEntry } from '@/lib/supabase';
import { getDerivedKey, encryptPasswordEntry } from '@/lib/encryption';

export default function AddPasswordForm({ onAdd, onCancel, userId }) {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (formData.password) {
      evaluatePasswordStrength(formData.password);
    }
  }, [formData.password]);

  const evaluatePasswordStrength = (pass) => {
    let strength = 0;

    if (pass.length >= 8) strength += 1;
    if (pass.length >= 12) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

    setPasswordStrength(strength);
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Moderate';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.website || !formData.username || !formData.password) {
      setError('Website, username, and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      const derivedKey = getDerivedKey();

      if (!derivedKey) {
        setError('Authentication error. Please log in again.');
        return;
      }

      const passwordData = {
        username: formData.username,
        password: formData.password,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };

      const encrypted = encryptPasswordEntry(passwordData, derivedKey);

      const { data, error: supabaseError } = await savePasswordEntry(
        userId,
        formData.website,
        encrypted,
      );

      if (supabaseError) throw supabaseError;

      onAdd({
        id: data[0].id,
        website: formData.website,
        ...passwordData,
      });

      // Reset form
      setFormData({
        website: '',
        username: '',
        password: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving password:', error);
      setError('Failed to save password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    if (!isClient) return;

    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let password = '';

    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()-_=+'[Math.floor(Math.random() * 14)];

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Shuffle the password
    password = password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
    evaluatePasswordStrength(password);
  };

  const useGeneratedPassword = () => {
    setFormData((prevData) => ({
      ...prevData,
      password: generatedPassword,
    }));
    setGeneratedPassword('');
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="card mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="website" className="form-label">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            required
            placeholder="example.com"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="username" className="form-label">
            Username/Email
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="user@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              className="input-field pr-24"
            />
            <div className="absolute inset-y-0 right-0 flex">
              <button
                type="button"
                className="px-3 py-2 text-text-secondary hover:text-text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="px-3 py-2 text-text-secondary hover:text-purple-400 hover:bg-dark-elevated rounded-r-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {formData.password && (
            <div className="mt-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-medium text-text-secondary">
                  Password Strength:{' '}
                  <span
                    className={
                      passwordStrength <= 2
                        ? 'text-red-400'
                        : passwordStrength <= 4
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }
                  >
                    {getStrengthLabel()}
                  </span>
                </p>
              </div>
              <div className="h-1 w-full bg-dark-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300 ease-out`}
                  style={{ width: `${(passwordStrength / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {generatedPassword && (
          <div className="bg-dark-elevated p-3 rounded-md border border-dark-border">
            <label className="form-label">Generated Password</label>
            <div className="flex">
              <div className="relative flex-1">
                <input
                  type={showGeneratedPassword ? 'text' : 'password'}
                  value={generatedPassword}
                  readOnly
                  className="input-field pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowGeneratedPassword(!showGeneratedPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
                >
                  {showGeneratedPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={useGeneratedPassword}
                className="ml-2 px-3 py-2 bg-purple-gradient text-white rounded-md hover:shadow-purple transition-shadow text-sm"
              >
                Use This
              </button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information (optional)"
            rows="3"
            className="input-field"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
