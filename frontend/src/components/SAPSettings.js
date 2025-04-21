'use client';

import { useState, useEffect } from 'react';
import { getSAPStatus } from '@/lib/api';

export default function SAPSettings() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  );

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      setError('');

      try {
        const statusData = await getSAPStatus();
        setStatus(statusData);
      } catch (err) {
        console.error('Error fetching SAP status:', err);
        setError(err.message || 'Failed to fetch SAP integration status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return (
    <section className="space-y-6">
      <div className="bg-dark-card rounded-lg border border-dark-border p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 rounded-full bg-blue-gradient">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              SAP Integration
            </h2>
            <p className="text-text-secondary">
              Manage your SAP Business Technology Platform integration
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12">
                <div className="animate-spin absolute h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 11l7-7 7 7M5 19l7-7 7 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-text-secondary">
                Loading SAP integration status...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-4">
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
        ) : (
          <div>
            <div className="mb-6">
              <div
                className={`flex items-center p-4 rounded-md ${
                  status?.status === 'connected'
                    ? 'bg-green-900/20 border border-green-800'
                    : 'bg-yellow-900/20 border border-yellow-800'
                }`}
              >
                <div
                  className={`p-2 rounded-full mr-3 ${
                    status?.status === 'connected'
                      ? 'bg-green-900/30'
                      : 'bg-yellow-900/30'
                  }`}
                >
                  {status?.status === 'connected' ? (
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
                  <h3
                    className={`text-lg font-medium ${
                      status?.status === 'connected'
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {status?.status === 'connected'
                      ? 'Connected to SAP'
                      : 'Not Connected'}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {status?.status === 'connected'
                      ? 'Your system is successfully connected to the SAP Business Technology Platform.'
                      : status?.is_configured
                      ? 'Your system is configured but not currently connected to SAP.'
                      : 'SAP integration is not configured. Please update the environment variables.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-elevated rounded-lg border border-dark-border p-4 mb-6">
              <h3 className="text-lg font-medium text-text-primary mb-3">
                Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="form-label">SAP API Base URL</label>
                  <div className="flex items-center bg-dark-surface rounded-md border border-dark-border">
                    <span className="flex-1 min-w-0 px-3 py-2 text-text-secondary text-sm font-mono overflow-x-auto">
                      {status?.base_url || 'Not configured'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label">SAP Authentication URL</label>
                  <div className="flex items-center bg-dark-surface rounded-md border border-dark-border">
                    <span className="flex-1 min-w-0 px-3 py-2 text-text-secondary text-sm font-mono overflow-x-auto">
                      {status?.auth_url || 'Not configured'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label">API Credentials</label>
                  <div className="bg-dark-surface rounded-md border border-dark-border p-3 text-text-secondary">
                    <p className="text-sm">
                      {status?.is_configured
                        ? 'Client ID and Client Secret configured'
                        : 'Client ID and Client Secret not configured'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-elevated rounded-lg border border-dark-border p-4">
              <h3 className="text-lg font-medium text-text-primary mb-3">
                How to Configure SAP Integration
              </h3>

              <ol className="space-y-3 text-text-secondary list-decimal ml-5">
                <li>
                  <p>
                    Create or access your SAP Business Technology Platform
                    account
                  </p>
                </li>
                <li>
                  <p>
                    Create a service instance for API access with the Business
                    Partner API scope
                  </p>
                </li>
                <li>
                  <p>Generate client credentials (Client ID and Secret)</p>
                </li>
                <li>
                  <p>
                    Add the following environment variables to your `.env` file:
                  </p>
                  <div className="bg-dark-surface rounded-md p-3 my-2 font-mono text-xs text-text-secondary">
                    <pre>{`SAP_API_BASE_URL=https://your-sap-api.com
SAP_CLIENT_ID=your_client_id
SAP_CLIENT_SECRET=your_client_secret  
SAP_AUTH_URL=https://your-sap-auth-url.com/oauth/token`}</pre>
                  </div>
                </li>
                <li>
                  <p>
                    Restart your backend API server to load the new environment
                    variables
                  </p>
                </li>
              </ol>

              <div className="bg-blue-900/20 border border-blue-800 text-blue-200 px-4 py-3 rounded-md mt-4 text-sm">
                <p className="flex items-center">
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
                  <span>
                    If you don't have SAP credentials, the system will use a
                    mock service that simulates SAP verification based on common
                    business email domains.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
