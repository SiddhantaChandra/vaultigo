// lib/encryption.js
'use client';

import CryptoJS from 'crypto-js';

// Constants
const VERIFICATION_TEXT = 'vaultigo-verify-me';
const SALT_BYTES = 16;
const PBKDF2_ITERATIONS = 100000; // High iteration count for security
const KEY_SIZE = 256 / 32; // 256 bits in words

// Generate a random salt
export function generateSalt() {
  if (typeof window === 'undefined') {
    return ''; // Server-side placeholder
  }

  const array = new Uint8Array(SALT_BYTES);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

// Derive encryption key from master password using PBKDF2
export async function deriveKeyFromPassword(password, salt) {
  if (typeof window === 'undefined') {
    return ''; // Server-side placeholder
  }

  try {
    // PBKDF2 is a password-based key derivation function
    // It's slower than plain hashing, which is good for security
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: KEY_SIZE,
      iterations: PBKDF2_ITERATIONS,
      hasher: CryptoJS.algo.SHA256,
    });

    // Return the key as a hex string
    return key.toString();
  } catch (error) {
    console.error('Error in key derivation:', error);
    throw new Error('Failed to derive encryption key');
  }
}

// Create verification blob to verify master password
export function createVerificationBlob(derivedKey) {
  try {
    // Encrypt a known text with the derived key
    const encrypted = CryptoJS.AES.encrypt(
      VERIFICATION_TEXT,
      derivedKey,
    ).toString();

    return encrypted;
  } catch (error) {
    console.error('Error creating verification blob:', error);
    throw new Error('Failed to create verification blob');
  }
}

// Verify the master password
export function verifyMasterPassword(derivedKey, verificationBlob) {
  try {
    // Try to decrypt the verification blob
    const decrypted = CryptoJS.AES.decrypt(
      verificationBlob,
      derivedKey,
    ).toString(CryptoJS.enc.Utf8);

    // Check if the decrypted text matches the verification text
    return decrypted === VERIFICATION_TEXT;
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}

// Encrypt a password entry
export function encryptPasswordEntry(passwordData, derivedKey) {
  try {
    const jsonString = JSON.stringify(passwordData);
    return CryptoJS.AES.encrypt(jsonString, derivedKey).toString();
  } catch (error) {
    console.error('Error encrypting password entry:', error);
    throw new Error('Failed to encrypt password entry');
  }
}

// Decrypt a password entry
export function decryptPasswordEntry(encryptedData, derivedKey) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, derivedKey);
    const jsonString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting password entry:', error);
    throw new Error('Failed to decrypt password entry');
  }
}

// Store the derived key in memory
// Warning: This is kept in memory only while the app is running
let currentDerivedKey = null;

// Set the current derived key
export function setDerivedKey(key) {
  currentDerivedKey = key;
}

// Get the current derived key
export function getDerivedKey() {
  return currentDerivedKey;
}

// Clear the derived key from memory
export function clearDerivedKey() {
  currentDerivedKey = null;
}

// For compatibility with the rest of your code
export async function initArgon2() {
  return true; // We're not using Argon2 anymore
}
