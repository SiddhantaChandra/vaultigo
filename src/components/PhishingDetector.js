'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PhishingDetector() {
  const [emailSender, setEmailSender] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Fetch user's scan history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('phishing_scans')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching scan history:', err);
      }
    };

    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Call the phishing detection API
      const response = await fetch('http://127.0.0.1:8000/check/', {
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
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Save scan result to Supabase
      const scanData = {
        email_sender: emailSender,
        email_snippet:
          emailBody.substring(0, 100) + (emailBody.length > 100 ? '...' : ''),
        is_phishing: data.is_phishing,
        confidence: data.confidence || 0,
        reasons: data.reasons || [],
      };

      const { error: insertError } = await supabase
        .from('phishing_scans')
        .insert([scanData]);

      if (insertError) {
        console.error('Error saving scan result:', insertError);
      } else {
        // Update history
        setHistory([scanData, ...history].slice(0, 10));
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
                    {scan.is_phishing ? '⚠️ Phishing Detected' : '✅ Safe'}
                  </p>
                  <p>{scan.email_snippet}</p>
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
            {result.is_phishing ? (
              <div>
                <h3>⚠️ Potential Phishing Detected!</h3>
                <p>
                  This email has been identified as a potential phishing
                  attempt.
                </p>
                <p>Confidence Score: {result.confidence || 'N/A'}</p>
              </div>
            ) : (
              <div>
                <h3>✅ Email Appears Safe</h3>
                <p>No phishing indicators were detected in this email.</p>
                <p>Confidence Score: {result.confidence || 'N/A'}</p>
              </div>
            )}
            {result.reasons && (
              <div>
                <h4>Warning Signs:</h4>
                <ul>
                  {result.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.is_phishing && (
              <div>
                <h4>Safety Tips:</h4>
                <ul>
                  <li>Never click on suspicious links in emails</li>
                  <li>
                    Do not provide personal information or credentials via email
                  </li>
                  <li>
                    Contact the sender through official channels to verify
                    authenticity
                  </li>
                  <li>
                    Check the actual email address of the sender, not just the
                    display name
                  </li>
                  <li>
                    Be suspicious of urgent requests that pressure you to act
                    quickly
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
