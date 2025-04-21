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

    return {
      status: data.status,
      threatLevel: data.status, // good, sus, bad
      susWords: data.suswords || [],
      isPhishing: data.status === 'sus' || data.status === 'bad',
      sapVerification: data.sap_verification || null,
      rawResponse: data,
    };
  } catch (error) {
    console.error('Error in checkPhishingEmail:', error);
    throw error;
  }
}

/**
 * Verify if an email belongs to a trusted SAP business partner
 * @param {string} email - The email address to verify
 * @returns {Promise<Object>} - The verification result
 */
export async function verifySAPBusinessPartner(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/sap/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in verifySAPBusinessPartner:', error);
    throw error;
  }
}

/**
 * Verify multiple email addresses against SAP business partners database
 * @param {string[]} emails - Array of email addresses to verify
 * @returns {Promise<Object[]>} - Array of verification results
 */
export async function verifyMultipleSAPPartners(emails) {
  try {
    const response = await fetch(`${API_BASE_URL}/sap/verify-emails/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in verifyMultipleSAPPartners:', error);
    throw error;
  }
}

/**
 * Check the status of SAP integration
 * @returns {Promise<Object>} - Status information
 */
export async function getSAPStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/sap/status/`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getSAPStatus:', error);
    throw error;
  }
}
