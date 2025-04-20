// lib/supabase.js
'use client';

import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use placeholders
// You'll need to add these to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

// User key operations
export async function saveUserKey(userId, salt, verification) {
  console.log('Attempting to save user key for userId:', userId);

  try {
    const { data, error } = await supabase
      .from('user_keys')
      .upsert({ user_id: userId, salt, verification })
      .select();

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

    const { data, error } = await supabase
      .from('user_keys')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user key:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) {
      console.log('No user key found for userId:', userId);
      return null;
    }

    console.log('Successfully retrieved user key');
    return data;
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
