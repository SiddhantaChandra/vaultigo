// lib/supabase.js
'use client';

import { createClient } from '@supabase/supabase-js';

// Use environment variables or hardcoded values for development
// In production, use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

// User key operations
export async function saveUserKey(userId, salt, verification) {
  console.log('Attempting to save user key for userId:', userId);

  try {
    // First, check if a record already exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_keys')
      .select('*')
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking for existing user key:', checkError);
      throw checkError;
    }

    let result;

    if (existingData && existingData.length > 0) {
      // Update existing record
      result = await supabase
        .from('user_keys')
        .update({ salt, verification })
        .eq('user_id', userId)
        .select();
    } else {
      // Insert new record
      result = await supabase
        .from('user_keys')
        .insert({ user_id: userId, salt, verification })
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error saving user key:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Successfully saved user key');
    return data;
  } catch (exception) {
    console.error('Exception in saveUserKey:', exception);
    throw exception;
  }
}

export async function getUserKey(userId) {
  if (!userId) {
    console.error('getUserKey was called with invalid userId:', userId);
    return null;
  }

  try {
    console.log('Attempting to fetch user key for userId:', userId);

    // Get all matching records first
    const { data, error } = await supabase
      .from('user_keys')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user key:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No user key found for userId:', userId);
      return null;
    }

    // Return the first record (there should be only one)
    console.log('Successfully retrieved user key');
    return data[0];
  } catch (exception) {
    console.error('Exception in getUserKey:', exception);
    return null;
  }
}

// Password entry operations
export async function savePasswordEntry(userId, website, encrypted) {
  return supabase
    .from('password_entries')
    .insert({
      user_id: userId,
      website,
      encrypted,
    })
    .select();
}

export async function getPasswordEntries(userId) {
  const { data, error } = await supabase
    .from('password_entries')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching password entries:', error);
    return [];
  }

  return data;
}

export async function updatePasswordEntry(id, website, encrypted) {
  return supabase
    .from('password_entries')
    .update({ website, encrypted })
    .eq('id', id)
    .select();
}

export async function deletePasswordEntry(id) {
  return supabase.from('password_entries').delete().eq('id', id);
}

// Anonymous user session management
export async function createAnonymousSession() {
  if (typeof window === 'undefined') {
    return ''; // Server-side placeholder
  }

  // Create a random userId if user isn't authenticated
  const anonymousId = crypto.randomUUID();
  // Store in local storage
  localStorage.setItem('vaultigo_anonymous_id', anonymousId);
  return anonymousId;
}

export function getAnonymousId() {
  if (typeof window === 'undefined') {
    return null; // Server-side placeholder
  }

  // Check if we have an anonymous ID stored
  const anonymousId = localStorage.getItem('vaultigo_anonymous_id');
  return anonymousId;
}

// Phishing detection related functions - API call moved to src/lib/api.js

export async function savePhishingScan(userId, scanData) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('phishing_scans')
      .insert([
        {
          user_id: userId,
          email_sender: scanData.emailSender,
          email_snippet:
            scanData.emailBody.substring(0, 100) +
            (scanData.emailBody.length > 100 ? '...' : ''),
          is_phishing: scanData.isPhishing,
          threat_level: scanData.threatLevel,
          sus_words: scanData.susWords,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving phishing scan:', error);
    return null;
  }
}

export async function getPhishingScans(userId, limit = 10) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('phishing_scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching phishing scans:', error);
    return [];
  }
}
