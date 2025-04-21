'use client';

// Constants
const HIBP_API_URL = 'https://haveibeenpwned.com/api/v3';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

let breachCheckCache = {
  passwords: {},
  emails: {},
};

export function loadBreachCheckCache() {
  if (typeof window === 'undefined') return;

  try {
    const cacheData = localStorage.getItem('vaultigo_breach_cache');
    if (cacheData) {
      breachCheckCache = JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading breach cache:', error);
    // Initialize fresh cache if loading fails
    breachCheckCache = { passwords: {}, emails: {} };
  }
}

export function saveBreachCheckCache() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      'vaultigo_breach_cache',
      JSON.stringify(breachCheckCache),
    );
  } catch (error) {
    console.error('Error saving breach cache:', error);
  }
}

export function cleanBreachCheckCache() {
  const now = Date.now();

  // Clean password cache
  Object.keys(breachCheckCache.passwords).forEach((pwHash) => {
    if (now - breachCheckCache.passwords[pwHash].timestamp > CACHE_EXPIRY) {
      delete breachCheckCache.passwords[pwHash];
    }
  });

  // Clean email cache
  Object.keys(breachCheckCache.emails).forEach((email) => {
    if (now - breachCheckCache.emails[email].timestamp > CACHE_EXPIRY) {
      delete breachCheckCache.emails[email];
    }
  });

  // Save cleaned cache
  saveBreachCheckCache();
}

/**
 * Check if a password has been exposed in known breaches using k-anonymity
 * @param {string} password
 * @returns {Promise<{breached: boolean, count: number, cachedResult: boolean}>}
 */
export async function checkPasswordBreach(password) {
  if (!password) {
    return { breached: false, count: 0, cachedResult: false };
  }

  try {
    // Generate SHA-1 hash of the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    // Check cache first
    if (
      breachCheckCache.passwords[hashHex] &&
      Date.now() - breachCheckCache.passwords[hashHex].timestamp < CACHE_EXPIRY
    ) {
      return {
        breached: breachCheckCache.passwords[hashHex].breached,
        count: breachCheckCache.passwords[hashHex].count,
        cachedResult: true,
      };
    }

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );

    if (!response.ok) {
      throw new Error(`Password API error: ${response.status}`);
    }

    const text = await response.text();
    const hashes = text.split('\r\n');

    const match = hashes.find((h) => h.split(':')[0] === suffix);
    const count = match ? parseInt(match.split(':')[1]) : 0;

    breachCheckCache.passwords[hashHex] = {
      breached: count > 0,
      count,
      timestamp: Date.now(),
    };
    saveBreachCheckCache();

    return { breached: count > 0, count, cachedResult: false };
  } catch (error) {
    console.error('Error checking password breach:', error);
    return {
      breached: false,
      count: 0,
      error: error.message,
      cachedResult: false,
    };
  }
}

/**
 * Check if an email has been exposed in known breaches
 * @param {string} email - The email to check
 * @returns {Promise<{breached: boolean, breaches: Array, cachedResult: boolean}>}
 */
export async function checkEmailBreach(email) {
  if (!email || !email.includes('@')) {
    return { breached: false, breaches: [], cachedResult: false };
  }

  try {
    // Check cache first
    if (
      breachCheckCache.emails[email] &&
      Date.now() - breachCheckCache.emails[email].timestamp < CACHE_EXPIRY
    ) {
      return {
        breached: breachCheckCache.emails[email].breached,
        breaches: breachCheckCache.emails[email].breaches,
        cachedResult: true,
      };
    }

    const response = await fetch(
      `/api/check-email-breach?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
      },
    );

    if (response.status === 404) {
      breachCheckCache.emails[email] = {
        breached: false,
        breaches: [],
        timestamp: Date.now(),
      };
      saveBreachCheckCache();

      return { breached: false, breaches: [], cachedResult: false };
    }

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`);
    }

    const breaches = await response.json();

    // Cache the result
    breachCheckCache.emails[email] = {
      breached: breaches.length > 0,
      breaches: breaches.map((b) => ({
        name: b.Name,
        domain: b.Domain,
        breachDate: b.BreachDate,
        dataClasses: b.DataClasses,
      })),
      timestamp: Date.now(),
    };
    saveBreachCheckCache();

    return {
      breached: breaches.length > 0,
      breaches: breachCheckCache.emails[email].breaches,
      cachedResult: false,
    };
  } catch (error) {
    console.error('Error checking email breach:', error);
    return {
      breached: false,
      breaches: [],
      error: error.message,
      cachedResult: false,
    };
  }
}

export function initHibpApi() {
  if (typeof window !== 'undefined') {
    loadBreachCheckCache();
    cleanBreachCheckCache();
  }
}
