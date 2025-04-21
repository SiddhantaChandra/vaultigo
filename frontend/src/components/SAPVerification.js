'use client';

import { useState, useEffect } from 'react';

export default function SAPVerification({ emailAddress }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  );

  const verifyEmail = async () => {
    if (!emailAddress) return;

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/sap/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const data = await response.json();
      setVerificationResult(data);
    } catch (err) {
      console.error('SAP verification error:', err);
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (emailAddress) {
      verifyEmail();
    }
  }, [emailAddress]);

  if (!emailAddress) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-text-primary mb-2">
        SAP Business Partner Verification
      </h3>

      {isVerifying ? (
        <div className="flex items-center space-x-2 text-text-secondary">
          <svg
            className="animate-spin h-4 w-4 text-purple-500"
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
          <span>Verifying with SAP...</span>
        </div>
      ) : error ? (
        <div className="text-red-400">
          <p>Error: {error}</p>
        </div>
      ) : verificationResult ? (
        <div
          className={`p-3 rounded-md border ${
            verificationResult.is_trusted
              ? 'border-green-500 bg-green-500/10'
              : 'border-yellow-500 bg-yellow-500/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-full ${
                verificationResult.is_trusted
                  ? 'bg-green-500/20'
                  : 'bg-yellow-500/20'
              }`}
            >
              {verificationResult.is_trusted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <h4
                className={`font-medium ${
                  verificationResult.is_trusted
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}
              >
                {verificationResult.is_trusted
                  ? 'Verified SAP Business Partner'
                  : 'Not a Verified Partner'}
              </h4>

              {verificationResult.is_trusted && (
                <div className="mt-1 text-text-secondary text-sm">
                  <p>
                    <span className="text-text-muted">Partner ID:</span>{' '}
                    {verificationResult.partner_id}
                  </p>
                  {verificationResult.partner_name && (
                    <p>
                      <span className="text-text-muted">Name:</span>{' '}
                      {verificationResult.partner_name}
                    </p>
                  )}
                  {verificationResult.partner_type && (
                    <p>
                      <span className="text-text-muted">Type:</span>{' '}
                      {verificationResult.partner_type}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs mt-2 text-text-secondary">
                {verificationResult.is_trusted
                  ? 'This email address belongs to a verified SAP business partner.'
                  : 'This email address is not recognized as a verified SAP business partner.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
