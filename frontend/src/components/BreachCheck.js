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
    <section>
      <div>
        <h2>Data Breach Check</h2>
        <p>
          Check if your passwords or email addresses have been exposed in known
          data breaches.
        </p>

        {lastScanDate && (
          <p>Last scan performed: {lastScanDate.toLocaleString()}</p>
        )}
      </div>

      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}

      {/* Credential Selection */}
      {!isScanning && !showResults && (
        <div>
          <div>
            <button
              onClick={loadCredentials}
              disabled={isScanning || credentials.length > 0}
            >
              Load Credentials
            </button>
            {credentials.length > 0 && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === credentials.length}
                    onChange={toggleAllCredentials}
                  />
                  Select All
                </label>

                <ul>
                  {credentials.map((credential) => (
                    <li key={credential.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(credential.id)}
                          onChange={() => toggleCredential(credential.id)}
                        />
                        {credential.website} ({credential.username})
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={startScan}
            disabled={isScanning || selectedItems.length === 0}
          >
            Start Breach Check
          </button>
        </div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <div>
          <h3>Checking for breaches...</h3>
          <p>
            Please wait while we check your credentials. This may take a few
            minutes.
          </p>
          <div>
            <div>
              <div
                style={{
                  width: `${progress}%`,
                  height: '8px',
                  backgroundColor: '#4299e1',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>
            <p>{progress}% complete</p>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {showResults && results && (
        <div>
          <h3>Breach Check Results</h3>
          <p>
            Checked {results.totalChecked} credentials on{' '}
            {results.checkedAt.toLocaleString()}
          </p>

          {results.compromisedPasswords.length > 0 ||
          results.compromisedEmails.length > 0 ? (
            <div>
              <h4>Compromised Credentials Found</h4>

              {results.compromisedPasswords.length > 0 && (
                <div>
                  <h5>
                    Compromised Passwords ({results.compromisedPasswords.length}
                    )
                  </h5>
                  <p>
                    These passwords have been found in data breaches. You should
                    change them immediately.
                  </p>
                  <ul>
                    {results.compromisedPasswords.map((item) => (
                      <li key={`pw-${item.id}`}>
                        <strong>{item.website}</strong> (username:{' '}
                        {item.username})
                        <p>
                          This password has appeared in{' '}
                          {item.occurrences.toLocaleString()} data breaches
                          {item.cachedResult ? ' (cached result)' : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.compromisedEmails.length > 0 && (
                <div>
                  <h5>
                    Compromised Email Addresses (
                    {results.compromisedEmails.length})
                  </h5>
                  <p>
                    These email addresses have been found in data breaches. Be
                    extra vigilant with these accounts.
                  </p>
                  <ul>
                    {results.compromisedEmails.map((item) => (
                      <li key={`email-${item.id}`}>
                        <strong>{item.website}</strong>
                        <p>
                          Email: {item.email}{' '}
                          {item.cachedResult ? ' (cached result)' : ''}
                        </p>
                        <p>Found in {item.breaches.length} breaches:</p>
                        <ul>
                          {item.breaches.map((breach, idx) => (
                            <li key={`breach-${item.id}-${idx}`}>
                              {breach.name} ({breach.breachDate})
                              {breach.dataClasses && (
                                <p>
                                  Compromised data:{' '}
                                  {breach.dataClasses.join(', ')}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4>Recommendations</h4>
                <ul>
                  <li>Change any compromised passwords immediately</li>
                  <li>Never reuse passwords across different sites</li>
                  <li>
                    Consider using a unique email address for important accounts
                  </li>
                  <li>Enable two-factor authentication where available</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h4>Good News!</h4>
              <p>
                None of your checked credentials were found in known data
                breaches. Continue practicing good password hygiene.
              </p>
            </div>
          )}

          {results.safeCredentials.length > 0 && (
            <div>
              <h5>Safe Credentials ({results.safeCredentials.length})</h5>
              <p>These credentials were not found in any known breaches:</p>
              <ul>
                {results.safeCredentials.map((item) => (
                  <li key={`safe-${item.id}`}>
                    <strong>{item.website}</strong> (username: {item.username})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button onClick={() => setShowResults(false)}>
              Back to Selection
            </button>
            <button onClick={startScan}>Scan Again</button>
          </div>
        </div>
      )}

      <div>
        <h4>About Data Breach Checking</h4>
        <p>
          This feature uses the "Have I Been Pwned" service to check if your
          credentials have been exposed in known data breaches.
        </p>
        <ul>
          <li>Your passwords are never sent to any server during this check</li>
          <li>
            For passwords, we use k-anonymity (only sending partial hashes)
          </li>
          <li>
            Email checks require API requests but are rate-limited for safety
          </li>
          <li>Results are cached locally to minimize unnecessary API calls</li>
        </ul>
      </div>
    </section>
  );
}
