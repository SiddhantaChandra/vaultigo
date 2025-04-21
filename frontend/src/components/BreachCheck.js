'use client';

import { useState, useEffect } from 'react';
import { getPasswordEntries, getAnonymousId } from '@/lib/supabase';
import { getDerivedKey, decryptPasswordEntry } from '@/lib/encryption';
import {
  checkPasswordBreach,
  checkEmailBreach,
  initHibpApi,
} from '@/lib/hibpApi';

const BATCH_SIZE = 5;
const BATCH_DELAY = 6000; // 6 seconds delay between batches due to API rate limits

export default function BreachCheck() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [lastScanDate, setLastScanDate] = useState(null);

  useEffect(() => {
    initHibpApi();

    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('vaultigo_last_breach_scan');
      if (savedDate) {
        setLastScanDate(new Date(parseInt(savedDate)));
      }
    }
  }, []);

  const loadCredentials = async () => {
    setError('');
    try {
      const userId = getAnonymousId();
      const derivedKey = getDerivedKey();

      if (!userId || !derivedKey) {
        throw new Error('Authentication required. Please log in again.');
      }

      const encryptedEntries = await getPasswordEntries(userId);

      const decryptedCredentials = encryptedEntries
        .map((entry) => {
          try {
            const decrypted = decryptPasswordEntry(entry.encrypted, derivedKey);
            return {
              id: entry.id,
              website: entry.website,
              username: decrypted.username,
              password: decrypted.password,
              lastChecked: null,
              isSelected: true, // Default to selected
            };
          } catch (error) {
            console.error(`Failed to decrypt entry ${entry.id}:`, error);
            return null;
          }
        })
        .filter((entry) => entry !== null);

      setCredentials(decryptedCredentials);
      setSelectedItems(decryptedCredentials.map((c) => c.id));
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError('Failed to load your credentials. Please try again.');
    }
  };

  const toggleCredential = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleAllCredentials = () => {
    if (selectedItems.length === credentials.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(credentials.map((c) => c.id));
    }
  };

  const startScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setProgress(0);
    setResults(null);
    setError('');
    setShowResults(false);

    try {
      if (credentials.length === 0) {
        await loadCredentials();
      }

      const selectedCredentials = credentials.filter((c) =>
        selectedItems.includes(c.id),
      );

      if (selectedCredentials.length === 0) {
        throw new Error('Please select at least one credential to check.');
      }

      const scanResults = {
        totalChecked: 0,
        compromisedEmails: [],
        compromisedPasswords: [],
        safeCredentials: [],
        checkedAt: new Date(),
      };

      for (let i = 0; i < selectedCredentials.length; i += BATCH_SIZE) {
        const batch = selectedCredentials.slice(i, i + BATCH_SIZE);

        for (const credential of batch) {
          const passwordResult = await checkPasswordBreach(credential.password);

          let emailResult = { breached: false, breaches: [] };
          if (credential.username.includes('@')) {
            emailResult = await checkEmailBreach(credential.username);
          }

          if (passwordResult.breached) {
            scanResults.compromisedPasswords.push({
              id: credential.id,
              website: credential.website,
              username: credential.username,
              occurrences: passwordResult.count,
              cachedResult: passwordResult.cachedResult,
            });
          }

          if (emailResult.breached) {
            scanResults.compromisedEmails.push({
              id: credential.id,
              website: credential.website,
              email: credential.username,
              breaches: emailResult.breaches,
              cachedResult: emailResult.cachedResult,
            });
          }

          if (!passwordResult.breached && !emailResult.breached) {
            scanResults.safeCredentials.push({
              id: credential.id,
              website: credential.website,
              username: credential.username,
            });
          }

          scanResults.totalChecked++;
          setProgress(
            Math.round(
              (scanResults.totalChecked / selectedCredentials.length) * 100,
            ),
          );
        }

        if (i + BATCH_SIZE < selectedCredentials.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      }

      setResults(scanResults);
      setShowResults(true);
      setLastScanDate(scanResults.checkedAt);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'vaultigo_last_breach_scan',
          scanResults.checkedAt.getTime().toString(),
        );
      }
    } catch (error) {
      console.error('Error during breach scan:', error);
      setError(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-dark-card rounded-lg border border-dark-border p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-full bg-purple-gradient mr-4">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Data Breach Check
            </h2>
            <p className="text-text-secondary">
              Check if your passwords or email addresses have been exposed in
              known data breaches.
            </p>
          </div>
        </div>

        {lastScanDate && (
          <div className="flex items-center mb-6 p-3 bg-dark-elevated rounded-md border border-dark-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-text-secondary text-sm">
              Last scan performed:{' '}
              <span className="text-text-primary font-medium">
                {lastScanDate.toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-6">
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

        {/* Credential Selection */}
        {!isScanning && !showResults && (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={loadCredentials}
                disabled={isScanning || credentials.length > 0}
                className={`btn-primary text-sm flex items-center ${
                  credentials.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Load Credentials
              </button>

              {credentials.length > 0 && (
                <button
                  onClick={startScan}
                  disabled={isScanning || selectedItems.length === 0}
                  className={`btn-primary text-sm flex items-center ${
                    selectedItems.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Breach Check
                </button>
              )}
            </div>

            {credentials.length > 0 && (
              <div className="bg-dark-elevated rounded-md p-4 border border-dark-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-text-primary font-medium">
                    Select Credentials to Check
                  </h3>
                  <label className="inline-flex items-center cursor-pointer text-text-secondary hover:text-text-primary">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 rounded text-purple-500 focus:ring-purple-500 focus:ring-offset-dark-background"
                      checked={selectedItems.length === credentials.length}
                      onChange={toggleAllCredentials}
                    />
                    <span className="ml-2 text-sm">Select All</span>
                  </label>
                </div>

                <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
                  {credentials.map((credential) => (
                    <div
                      key={credential.id}
                      className={`p-3 rounded-md border transition-colors ${
                        selectedItems.includes(credential.id)
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : 'border-dark-border bg-dark-card'
                      }`}
                    >
                      <label className="flex items-center justify-between w-full cursor-pointer">
                        <div className="overflow-hidden">
                          <div className="font-medium text-text-primary truncate">
                            {credential.website}
                          </div>
                          <div className="text-sm text-text-secondary truncate">
                            {credential.username}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 rounded text-purple-500 focus:ring-purple-500 focus:ring-offset-dark-background"
                          checked={selectedItems.includes(credential.id)}
                          onChange={() => toggleCredential(credential.id)}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="bg-dark-elevated p-5 rounded-lg border border-dark-border">
            <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-purple-500"
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
              Checking for breaches...
            </h3>
            <p className="text-text-secondary mb-6">
              Please wait while we check your credentials. This may take a few
              minutes due to API rate limits.
            </p>
            <div className="mb-2">
              <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-2 bg-purple-gradient transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-right text-sm text-text-secondary">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Scan Results */}
        {showResults && results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">
                  Breach Check Results
                </h3>
                <p className="text-text-secondary text-sm">
                  Checked {results.totalChecked} credentials on{' '}
                  {results.checkedAt.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setShowResults(false)}
                className="btn-secondary text-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Selection
              </button>
            </div>

            {results.compromisedPasswords.length > 0 ||
            results.compromisedEmails.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h4 className="text-xl font-medium text-red-300 mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Compromised Credentials Found
                  </h4>

                  {results.compromisedPasswords.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-lg font-medium text-red-200 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Compromised Passwords (
                        {results.compromisedPasswords.length})
                      </h5>
                      <p className="text-red-200/80 mb-3">
                        These passwords have been found in data breaches. You
                        should change them immediately.
                      </p>
                      <div className="space-y-2">
                        {results.compromisedPasswords.map((item) => (
                          <div
                            key={`pw-${item.id}`}
                            className="bg-red-900/30 p-3 rounded border border-red-800/50"
                          >
                            <div className="font-medium text-red-100 mb-1">
                              {item.website}
                            </div>
                            <p className="text-red-200/80 text-sm">
                              Username: {item.username}
                            </p>
                            <p className="text-red-200/80 text-sm">
                              This password has appeared in{' '}
                              <span className="font-semibold text-red-100">
                                {item.occurrences.toLocaleString()}
                              </span>{' '}
                              data breaches
                              {item.cachedResult ? ' (cached result)' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.compromisedEmails.length > 0 && (
                    <div>
                      <h5 className="text-lg font-medium text-red-200 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Compromised Email Addresses (
                        {results.compromisedEmails.length})
                      </h5>
                      <p className="text-red-200/80 mb-3">
                        These email addresses have been found in data breaches.
                        Be extra vigilant with these accounts.
                      </p>
                      <div className="space-y-4">
                        {results.compromisedEmails.map((item) => (
                          <div
                            key={`email-${item.id}`}
                            className="bg-red-900/30 p-3 rounded border border-red-800/50"
                          >
                            <div className="font-medium text-red-100 mb-1">
                              {item.website}
                            </div>
                            <p className="text-red-200/80 text-sm mb-2">
                              Email: {item.email}{' '}
                              {item.cachedResult ? ' (cached result)' : ''}
                            </p>
                            <div>
                              <p className="text-red-100 text-sm font-medium">
                                Found in {item.breaches.length} breaches:
                              </p>
                              <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                                {item.breaches.map((breach, idx) => (
                                  <div
                                    key={`breach-${item.id}-${idx}`}
                                    className="text-xs p-2 bg-red-900/40 rounded"
                                  >
                                    <span className="font-medium text-red-100">
                                      {breach.name}
                                    </span>{' '}
                                    ({breach.breachDate})
                                    {breach.dataClasses &&
                                      breach.dataClasses.length > 0 && (
                                        <p className="mt-1 text-red-200/70">
                                          Compromised data:{' '}
                                          <span className="text-red-200">
                                            {breach.dataClasses.join(', ')}
                                          </span>
                                        </p>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
                  <h4 className="text-lg font-medium text-text-primary mb-3">
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
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
                      <span className="text-text-secondary">
                        Change any compromised passwords immediately
                      </span>
                    </li>
                    <li className="flex items-start">
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
                      <span className="text-text-secondary">
                        Never reuse passwords across different sites
                      </span>
                    </li>
                    <li className="flex items-start">
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
                      <span className="text-text-secondary">
                        Consider using a unique email address for important
                        accounts
                      </span>
                    </li>
                    <li className="flex items-start">
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
                      <span className="text-text-secondary">
                        Enable two-factor authentication where available
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-center">
                <div className="inline-flex items-center justify-center p-2 bg-green-900/30 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-400"
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
                <h4 className="text-xl font-medium text-green-400 mb-2">
                  Good News!
                </h4>
                <p className="text-green-300">
                  None of your checked credentials were found in known data
                  breaches. Continue practicing good password hygiene.
                </p>
              </div>
            )}

            {results.safeCredentials.length > 0 && (
              <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
                <h5 className="text-lg font-medium text-text-primary mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Safe Credentials ({results.safeCredentials.length})
                </h5>
                <p className="text-text-secondary mb-3">
                  These credentials were not found in any known breaches:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {results.safeCredentials.map((item) => (
                    <div
                      key={`safe-${item.id}`}
                      className="bg-green-900/10 p-2 rounded-md border border-green-900/20"
                    >
                      <p className="font-medium text-green-300">
                        {item.website}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {item.username}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setShowResults(false)}
                className="btn-secondary text-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Selection
              </button>
              <button
                onClick={startScan}
                className="btn-primary text-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-dark-elevated rounded-lg border border-dark-border p-4">
        <h4 className="text-text-primary font-medium mb-2">
          About Data Breach Checking
        </h4>
        <p className="text-text-secondary text-sm mb-3">
          This feature uses the "Have I Been Pwned" service to check if your
          credentials have been exposed in known data breaches.
        </p>
        <ul className="space-y-1 text-text-secondary text-sm">
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Your passwords are never sent to any server during this check
            </span>
          </li>
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              For passwords, we use k-anonymity (only sending partial hashes)
            </span>
          </li>
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Email checks require API requests but are rate-limited for safety
            </span>
          </li>
          <li className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Results are cached locally to minimize unnecessary API calls
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
