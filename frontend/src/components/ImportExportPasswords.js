'use client';

import { useState, useRef } from 'react';
import {
  savePasswordEntry,
  getPasswordEntries,
  getAnonymousId,
} from '@/lib/supabase';
import {
  getDerivedKey,
  encryptPasswordEntry,
  decryptPasswordEntry,
} from '@/lib/encryption';
import { parseChromePasswordCsv, createPasswordCsv } from '@/lib/csvUtils';
import ImportExportGuide from './ImportExportGuide';

export default function ImportExportPasswords() {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
  });
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Chrome CSV import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Reading file...');
    setImportError('');
    setImportStats({ total: 0, success: 0, failed: 0 });

    try {
      // Get user ID and derived key
      const userId = getAnonymousId();
      const derivedKey = getDerivedKey();

      if (!userId || !derivedKey) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Read the file
      const text = await file.text();
      setImportStatus('Parsing data...');

      // Parse CSV using our utility function
      const passwordEntries = parseChromePasswordCsv(text);

      if (passwordEntries.length === 0) {
        throw new Error('No valid password entries found in the CSV file.');
      }

      setImportStats((prev) => ({ ...prev, total: passwordEntries.length }));

      // Start importing passwords
      setImportStatus(`Importing ${passwordEntries.length} passwords...`);

      let successCount = 0;
      let failureCount = 0;

      // Process each password entry
      for (const entry of passwordEntries) {
        try {
          // Prepare password data
          const passwordData = {
            username: entry.username,
            password: entry.password,
            notes: entry.notes,
            createdAt: new Date().toISOString(),
          };

          // Encrypt and save
          const encrypted = encryptPasswordEntry(passwordData, derivedKey);
          await savePasswordEntry(userId, entry.website, encrypted);

          successCount++;
          setImportStats((prev) => ({ ...prev, success: successCount }));
        } catch (err) {
          console.error('Error importing password:', err);
          failureCount++;
          setImportStats((prev) => ({ ...prev, failed: failureCount }));
        }

        // Update status periodically
        if ((successCount + failureCount) % 5 === 0) {
          setImportStatus(
            `Importing... ${successCount + failureCount}/${
              passwordEntries.length
            } processed`,
          );
        }
      }

      setImportStatus(
        `Import complete: ${successCount} passwords imported successfully, ${failureCount} failed.`,
      );
    } catch (error) {
      console.error('Import error:', error);
      setImportError(`Import failed: ${error.message}`);
      setImportStatus('');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle password export
  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Get user ID and derived key
      const userId = getAnonymousId();
      const derivedKey = getDerivedKey();

      if (!userId || !derivedKey) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Fetch all encrypted passwords
      const encryptedEntries = await getPasswordEntries(userId);

      if (encryptedEntries.length === 0) {
        throw new Error('No passwords to export');
      }

      // Decrypt each entry
      const decryptedPasswords = encryptedEntries
        .map((entry) => {
          try {
            const decrypted = decryptPasswordEntry(entry.encrypted, derivedKey);
            return {
              website: entry.website,
              username: decrypted.username,
              password: decrypted.password,
              notes: decrypted.notes || '',
            };
          } catch (error) {
            console.error(`Failed to decrypt entry ${entry.id}:`, error);
            return null;
          }
        })
        .filter((entry) => entry !== null);

      // Create CSV data using our utility function
      const csvData = createPasswordCsv(decryptedPasswords);

      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vaultigo_passwords.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-dark-card rounded-lg border border-dark-border p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 rounded-full bg-purple-gradient">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Import & Export
            </h2>
            <p className="text-text-secondary">
              Transfer your passwords between services
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="btn-secondary text-sm flex items-center mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          How to Use Import/Export
        </button>

        {showGuide ? (
          <ImportExportGuide onClose={() => setShowGuide(false)} />
        ) : (
          <div className="space-y-6">
            <div className="bg-dark-elevated rounded-lg border border-dark-border p-5">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-purple-900/30 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Import Passwords
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Import passwords from Chrome CSV export
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="relative flex items-center justify-center px-4 py-3 border border-dashed border-dark-border bg-dark-surface rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      disabled={isImporting}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-text-primary font-medium">
                        {isImporting
                          ? 'Processing...'
                          : 'Choose CSV File or Drag & Drop'}
                      </span>
                      <span className="text-text-secondary text-xs">
                        File must be Chrome password export in CSV format
                      </span>
                    </div>
                  </label>

                  <details className="bg-dark-surface p-3 rounded-md border border-dark-border">
                    <summary className="text-text-primary text-sm font-medium cursor-pointer">
                      What's a Chrome password export?
                    </summary>
                    <div className="mt-2 text-text-secondary text-sm">
                      <p>You can export your saved passwords from Chrome by:</p>
                      <ol className="list-decimal ml-5 mt-2 space-y-1">
                        <li>Open Chrome and go to Settings</li>
                        <li>Click on "Autofill" in the left sidebar</li>
                        <li>Select "Password Manager"</li>
                        <li>
                          Click the three dots (⋮) and select "Export passwords"
                        </li>
                        <li>Save the file and then upload it here</li>
                      </ol>
                    </div>
                  </details>
                </div>

                {importStatus && (
                  <div className="bg-dark-surface p-3 rounded-md border border-dark-border">
                    <p className="text-text-primary">{importStatus}</p>
                  </div>
                )}

                {importError && (
                  <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md">
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
                      {importError}
                    </p>
                  </div>
                )}

                {importStats.total > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="text-text-secondary">
                        Progress: {importStats.success + importStats.failed}/
                        {importStats.total}
                      </span>
                      <span className="text-text-secondary">
                        {Math.round(
                          ((importStats.success + importStats.failed) /
                            importStats.total) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-gradient transition-all duration-300 ease-out"
                        style={{
                          width: `${
                            ((importStats.success + importStats.failed) /
                              importStats.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-green-400">
                        Success: {importStats.success}
                      </span>
                      {importStats.failed > 0 && (
                        <span className="text-red-400">
                          Failed: {importStats.failed}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-dark-elevated rounded-lg border border-dark-border p-5">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-purple-900/30 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Export Passwords
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Export all your passwords as a CSV file
                  </p>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-primary w-full flex justify-center items-center mb-4"
              >
                {isExporting ? (
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
                    Exporting...
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
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Export Passwords
                  </>
                )}
              </button>

              <div className="p-3 bg-red-900/10 border border-red-800/30 rounded-md text-sm">
                <p className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-200">
                    <strong>Security note:</strong> Exported files contain plain
                    text passwords. Keep the file secure and delete it after
                    use.
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
