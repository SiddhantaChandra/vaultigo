'use client';

import { useState, useEffect } from 'react';
import {
  savePhishingScan,
  getPhishingScans,
  getAnonymousId,
} from '@/lib/supabase';
import {
  checkPhishingEmail,
  getThreatLevelDescription,
  getSafetyRecommendations,
} from '@/lib/api';

export default function PhishingDetector() {
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize user ID and fetch scan history
  useEffect(() => {
    const initializeUser = async () => {
      // Get the user ID
      const userIdentifier = getAnonymousId();
      if (userIdentifier) {
        setUserId(userIdentifier);

        // Fetch scan history for this user
        try {
          const scans = await getPhishingScans(userIdentifier);
          setHistory(scans);
        } catch (err) {
          console.error('Error fetching scan history:', err);
        }
      }
    };

    initializeUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call the phishing detection API through our Supabase client
      const phishingResult = await checkPhishingEmail(emailSender, emailBody);

      // Process the result
      setResult({
        isPhishing: phishingResult.isPhishing,
        threatLevel: phishingResult.threatLevel,
        susWords: phishingResult.susWords,
      });

      // Save scan result if we have a user ID
      if (userId) {
        const scanData = {
          emailSender,
          emailBody,
          isPhishing: phishingResult.isPhishing,
          threatLevel: phishingResult.threatLevel,
          susWords: phishingResult.susWords,
        };

        await savePhishingScan(userId, scanData);

        // Update the history
        const updatedHistory = await getPhishingScans(userId);
        setHistory(updatedHistory);
      }
    } catch (err) {
      setError(`Failed to check email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEmailSender('');
    setEmailBody('');
    setResult(null);
    setError('');
  };

  const loadExample = (example) => {
    setEmailSender(example.sender);
    setEmailBody(example.body);
  };

  // Render threat level label with appropriate color
  const renderThreatLevel = (threatLevel) => {
    if (threatLevel === 'good') {
      return <span style={{ color: 'green' }}>✅ Safe</span>;
    } else if (threatLevel === 'sus') {
      return <span style={{ color: 'orange' }}>⚠️ Suspicious</span>;
    } else if (threatLevel === 'bad') {
      return <span style={{ color: 'red' }}>🚫 Dangerous</span>;
    }
    return <span>Unknown</span>;
  };

  // Sample phishing examples
  const phishingExamples = [
    {
      name: 'Bank Account Alert',
      sender: 'security@bankofamerica-secure.com',
      body: 'Dear Valued Customer,\n\nYour Bank of America account has been temporarily limited due to failed login attempts. To restore full access to your account, please verify your information by clicking the link below:\n\nhttps://bankofamerica-secure.verification-center.com/login\n\nFailure to verify your account within 24 hours will result in permanent account suspension.\n\nThank you,\nBank of America Security Team',
    },
    {
      name: 'IT Password Reset',
      sender: 'itsupport@company-helpdesk.net',
      body: 'URGENT: YOUR PASSWORD EXPIRES TODAY\n\nDue to a security update, your company email password will expire in 2 hours. To avoid losing access to your account, please reset your password immediately by clicking the link below:\n\nRESET PASSWORD NOW: http://company-helpdesk.net/pw-reset?user=target\n\nThis is an automated message. Do not reply.',
    },
    {
      name: 'Payment Confirmation',
      sender: 'noreply@amaz0n-orders.com',
      body: 'Hello Customer,\n\nThank you for your recent purchase from Amazon. Your payment of $499.99 for a New iPhone 15 has been processed.\n\nOrder #: AMZ-87654321\nShipping: Express (2-day)\n\nIf you did not make this purchase, please click the link below to cancel the order immediately:\n\nCANCEL ORDER: http://amazon-orders-secure.com/cancel?order=87654321\n\nAmazon Customer Service',
    },
  ];

  return (
    <div>
      <h1>Phishing Email Detector</h1>
      <p>Paste an email to check if it's a potential phishing attempt</p>

      <div>
        <button type="button" onClick={() => setShowExamples(!showExamples)}>
          {showExamples ? 'Hide Examples' : 'View Sample Phishing Emails'}
        </button>

        <button type="button" onClick={() => setViewHistory(!viewHistory)}>
          {viewHistory ? 'Hide History' : 'View Scan History'}
        </button>
      </div>

      {showExamples && (
        <div>
          <h3>Sample Phishing Emails</h3>
          <p>Click on an example to load it into the form</p>
          <div>
            {phishingExamples.map((example, index) => (
              <div key={index}>
                <h4>{example.name}</h4>
                <p>From: {example.sender}</p>
                <button type="button" onClick={() => loadExample(example)}>
                  Load Example
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewHistory && (
        <div>
          <h3>Your Recent Scans</h3>
          {history.length === 0 ? (
            <p>No scan history available</p>
          ) : (
            <div>
              {history.map((scan, index) => (
                <div key={index}>
                  <p>
                    <strong>From:</strong> {scan.email_sender}
                    <span> - </span>
                    {renderThreatLevel(scan.threat_level)}
                  </p>
                  <p>{scan.email_snippet}</p>
                  {scan.sus_words && scan.sus_words.length > 0 && (
                    <p>
                      <strong>Suspicious terms:</strong>{' '}
                      {scan.sus_words.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emailSender">Sender Email Address</label>
          <input
            type="text"
            id="emailSender"
            value={emailSender}
            onChange={(e) => setEmailSender(e.target.value)}
            placeholder="example@domain.com"
            required
          />
        </div>

        <div>
          <label htmlFor="emailBody">Email Content</label>
          <textarea
            id="emailBody"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Paste the full email content here..."
            rows="10"
            required
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Check Email'}
          </button>
          <button type="button" onClick={clearForm}>
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div>
          <h2>Analysis Results</h2>
          <div>
            <h3>{renderThreatLevel(result.threatLevel)}</h3>

            <p>{getThreatLevelDescription(result.threatLevel)}</p>

            {result.susWords && result.susWords.length > 0 && (
              <div>
                <h4>Suspicious Words/Phrases Detected:</h4>
                <ul>
                  {result.susWords.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4>Safety Recommendations:</h4>
              <ul>
                {getSafetyRecommendations(result.threatLevel).map(
                  (tip, index) => (
                    <li key={index}>{tip}</li>
                  ),
                )}
              </ul>
            </div>

            {!result.isPhishing &&
              result.susWords &&
              result.susWords.length > 0 && (
                <div>
                  <h4>Note:</h4>
                  <p>
                    Although the email appears safe, it contains some
                    potentially suspicious words or phrases. Always exercise
                    caution when dealing with emails containing sensitive
                    information.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
