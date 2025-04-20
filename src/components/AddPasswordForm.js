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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      // Get derived key from memory
      const derivedKey = getDerivedKey();

      if (!derivedKey) {
        setError('Authentication error. Please log in again.');
        return;
      }

      // Create password data object
      const passwordData = {
        username: formData.username,
        password: formData.password,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };

      // Encrypt the password data
      const encrypted = encryptPasswordEntry(passwordData, derivedKey);

      // Save to Supabase
      const { data, error } = await savePasswordEntry(
        userId,
        formData.website,
        encrypted,
      );

      if (error) throw error;

      // Add the new password to the list
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

    const length = 16; // Default length
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let password = '';

    // Ensure at least one of each character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()-_=+'[Math.floor(Math.random() * 14)];

    // Fill the rest randomly
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
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            required
            placeholder="example.com"
          />
        </div>

        <div>
          <label htmlFor="username">Username/Email</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
            <button type="button" onClick={generateRandomPassword}>
              Generate
            </button>
          </div>
        </div>

        {generatedPassword && (
          <div>
            <label>Generated Password</label>
            <div>
              <input
                type={showGeneratedPassword ? 'text' : 'password'}
                value={generatedPassword}
                readOnly
              />
              <button
                type="button"
                onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
              >
                {showGeneratedPassword ? 'Hide' : 'Show'}
              </button>
              <button type="button" onClick={useGeneratedPassword}>
                Use This
              </button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information (optional)"
          />
        </div>

        {error && <p>{error}</p>}

        <div>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
