'use client';

// Define the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Check if an email is a potential phishing attempt
 * @param {string} emailSender - The sender's email address
 * @param {string} emailBody - The content of the email
 * @returns {Promise<Object>} - The result of the phishing check
 */
export async function checkPhishingEmail(emailSender, emailBody) {
  try {
    const response = await fetch(`${API_BASE_URL}/check/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailbody: emailBody,
        emailsender: emailSender,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Map the API response to a standardized format
    return {
      status: data.status,
      threatLevel: data.status, // 'good', 'sus', or 'bad'
      susWords: data.suswords || [],
      isPhishing: data.status === 'sus' || data.status === 'bad',
      rawResponse: data, // Include the raw response for debugging
    };
  } catch (error) {
    console.error('Error in checkPhishingEmail:', error);
    throw error;
  }
}

/**
 * Get a readable description for a threat level
 * @param {string} threatLevel - The threat level ('good', 'sus', 'bad')
 * @returns {string} - Human-readable description
 */
export function getThreatLevelDescription(threatLevel) {
  switch (threatLevel) {
    case 'good':
      return 'This email appears to be safe.';
    case 'sus':
      return 'This email contains suspicious elements and may be a phishing attempt.';
    case 'bad':
      return 'This email is likely a phishing attempt. Exercise extreme caution.';
    default:
      return 'Unable to determine the threat level of this email.';
  }
}

/**
 * Get safety recommendations based on threat level
 * @param {string} threatLevel - The threat level ('good', 'sus', 'bad')
 * @returns {string[]} - Array of safety recommendations
 */
export function getSafetyRecommendations(threatLevel) {
  const baseRecommendations = [
    'Never click on suspicious links in emails',
    'Do not provide personal information or credentials via email',
    'Be careful with attachments from unknown senders',
  ];

  if (threatLevel === 'good') {
    return ['Always stay vigilant, even when emails appear legitimate.'];
  }

  if (threatLevel === 'sus') {
    return [
      ...baseRecommendations,
      'Verify the sender by contacting them through official channels',
      'Check the actual email address of the sender, not just the display name',
    ];
  }

  if (threatLevel === 'bad') {
    return [
      ...baseRecommendations,
      'Report this email as phishing to your IT department or email provider',
      'Delete the email immediately',
      "If you've clicked any links or provided information, change your passwords immediately",
      'Monitor your accounts for any suspicious activity',
    ];
  }

  return baseRecommendations;
}
