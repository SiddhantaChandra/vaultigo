// lib/encryption.js
'use client';

import CryptoJS from 'crypto-js';

// Dynamically import argon2-browser to avoid server-side issues
let argon2;
if (typeof window !== 'undefined') {
  // We're in the browser
  import('argon2-browser').then((module) => {
    argon2 = module;
  });
}

// Constants
const VERIFICATION_TEXT = 'vaultigo-verify-me';
const SALT_BYTES = 16;
const ARGON2_OPTIONS = {
  timeCost: 4, // Number of iterations
  memoryCost: 16384, // 16 MiB
  parallelism: 2, // Degree of parallelism
};

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

// Derive encryption key from master password using Argon2
export async function deriveKeyFromPassword(password, salt) {
  if (typeof window === 'undefined' || !argon2) {
    return ''; // Server-side placeholder
  }

  try {
    // Convert hex salt to Uint8Array
    const saltArray = new Uint8Array(
      salt.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
    );

    const result = await argon2.hash({
      pass: password,
      salt: saltArray,
      ...ARGON2_OPTIONS,
      type: argon2.ArgonType.Argon2id,
    });

    // Return the hash as a hex string
    return result.hashHex;
  } catch (error) {
    console.error('Error in key derivation:', error);
    throw new Error('Failed to derive encryption key');
  }
}

// Create verification blob to verify master password
export async function createVerificationBlob(derivedKey) {
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
export async function verifyMasterPassword(derivedKey, verificationBlob) {
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
