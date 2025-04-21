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

  useEffect(() => {
    const initializeUser = async () => {
      const userIdentifier = getAnonymousId();
      if (userIdentifier) {
        setUserId(userIdentifier);

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
      const phishingResult = await checkPhishingEmail(emailSender, emailBody);

      // Process the result
      setResult({
        isPhishing: phishingResult.isPhishing,
        threatLevel: phishingResult.threatLevel,
        susWords: phishingResult.susWords,
      });

      if (userId) {
        const scanData = {
          emailSender,
          emailBody,
          isPhishing: phishingResult.isPhishing,
          threatLevel: phishingResult.threatLevel,
          susWords: phishingResult.susWords,
        };

        await savePhishingScan(userId, scanData);

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

  // Get threat level color and icon
  const getThreatLevelInfo = (threatLevel) => {
    switch (threatLevel) {
      case 'good':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/30',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Safe',
        };
      case 'sus':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Suspicious',
        };
      case 'bad':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/30',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Dangerous',
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30',
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          ),
          label: 'Unknown',
        };
    }
  };

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
    <div className="space-y-8">
      <div className="bg-dark-card rounded-lg border border-dark-border p-6">
        <h1 className="text-2xl font-semibold mb-2 text-text-primary">
          Phishing Email Detector
        </h1>
        <p className="text-text-secondary mb-6">
          Analyze suspicious emails for potential phishing attempts with our
          machine learning-based detection
        </p>

        <div className="flex space-x-3 mb-6">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="btn-secondary text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            {showExamples ? 'Hide Examples' : 'View Sample Emails'}
          </button>

          <button
            type="button"
            onClick={() => setViewHistory(!viewHistory)}
            className="btn-secondary text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {viewHistory ? 'Hide History' : 'View Scan History'}
          </button>
        </div>

        {showExamples && (
          <div className="bg-dark-elevated rounded-lg border border-dark-border p-4 mb-6 animate-fadeIn">
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Sample Phishing Emails
            </h3>
            <p className="text-text-secondary mb-4">
              Click on an example to load it into the form
            </p>
            <div className="space-y-4">
              {phishingExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md border border-dark-border hover:border-purple-500 transition-colors"
                >
                  <h4 className="text-lg font-medium text-text-primary mb-1">
                    {example.name}
                  </h4>
                  <p className="text-text-secondary text-sm mb-3">
                    <span className="text-text-muted">From:</span>{' '}
                    {example.sender}
                  </p>
                  <button
                    type="button"
                    onClick={() => loadExample(example)}
                    className="btn-primary text-sm"
                  >
                    Load Example
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewHistory && (
          <div className="bg-dark-elevated rounded-lg border border-dark-border p-4 mb-6 animate-fadeIn">
            <h3 className="text-xl font-medium text-text-primary mb-3">
              Your Recent Scans
            </h3>
            {history.length === 0 ? (
              <p className="text-text-secondary italic">
                No scan history available
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {history.map((scan, index) => {
                  const threatInfo = getThreatLevelInfo(scan.threat_level);
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${threatInfo.borderColor} ${threatInfo.bgColor}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-text-primary font-medium truncate mr-2 flex-1">
                          <span className="text-text-muted">From:</span>{' '}
                          {scan.email_sender}
                        </p>
                        <span
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${threatInfo.color} ${threatInfo.bgColor}`}
                        >
                          {threatInfo.icon}
                          <span>{threatInfo.label}</span>
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                        {scan.email_snippet}
                      </p>
                      {scan.sus_words && scan.sus_words.length > 0 && (
                        <p className="text-text-secondary text-xs">
                          <span className="text-text-muted">
                            Suspicious terms:
                          </span>{' '}
                          {scan.sus_words.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="emailSender" className="form-label">
              Sender Email Address
            </label>
            <input
              type="text"
              id="emailSender"
              value={emailSender}
              onChange={(e) => setEmailSender(e.target.value)}
              placeholder="example@domain.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="emailBody" className="form-label">
              Email Content
            </label>
            <textarea
              id="emailBody"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Paste the full email content here..."
              rows="10"
              className="input-field font-mono text-sm"
              required
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={clearForm}
              className="btn-secondary flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Check Email
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-dark-card rounded-lg border border-dark-border p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Analysis Results
          </h2>
          <div>
            {(() => {
              const threatInfo = getThreatLevelInfo(result.threatLevel);
              return (
                <div
                  className={`flex items-center space-x-2 p-4 rounded-md ${threatInfo.bgColor} mb-4`}
                >
                  <div
                    className={`p-2 rounded-full ${threatInfo.bgColor} ${threatInfo.color}`}
                  >
                    {threatInfo.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${threatInfo.color}`}>
                      {threatInfo.label}
                    </h3>
                    <p className="text-text-secondary">
                      {getThreatLevelDescription(result.threatLevel)}
                    </p>
                  </div>
                </div>
              );
            })()}

            {result.susWords && result.susWords.length > 0 && (
              <div className="mb-4">
                <h4 className="text-text-primary font-medium mb-2">
                  Suspicious Words/Phrases Detected:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.susWords.map((word, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-400/10 text-yellow-300 text-xs font-medium rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-dark-elevated p-4 rounded-md border border-dark-border mb-4">
              <h4 className="text-text-primary font-medium mb-2">
                Safety Recommendations:
              </h4>
              <ul className="space-y-2 text-text-secondary">
                {getSafetyRecommendations(result.threatLevel).map(
                  (tip, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{tip}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {!result.isPhishing &&
              result.susWords &&
              result.susWords.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-800 text-blue-200 px-4 py-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Note:
                  </h4>
                  <p className="mt-1 text-sm">
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
