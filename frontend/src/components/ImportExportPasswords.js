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
    <section>
      <div>
        <h2>Import & Export</h2>
        <button onClick={() => setShowGuide(true)}>
          How to Use Import/Export
        </button>
      </div>

      {showGuide ? (
        <ImportExportGuide onClose={() => setShowGuide(false)} />
      ) : (
        <>
          <div>
            <h3>Import Passwords</h3>
            <p>Import passwords from Chrome CSV export</p>

            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={isImporting}
                ref={fileInputRef}
              />
              <p>File must be Chrome password export in CSV format</p>

              <div>
                <details>
                  <summary>What's a Chrome password export?</summary>
                  <div>
                    <p>You can export your saved passwords from Chrome by:</p>
                    <ol>
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
            </div>

            {importStatus && <p>{importStatus}</p>}
            {importError && <p style={{ color: 'red' }}>{importError}</p>}

            {importStats.total > 0 && (
              <div>
                <p>
                  Progress: {importStats.success + importStats.failed}/
                  {importStats.total}
                </p>
                <div>
                  <div
                    style={{
                      width: `${
                        ((importStats.success + importStats.failed) /
                          importStats.total) *
                        100
                      }%`,
                      height: '8px',
                      backgroundColor: '#4CAF50',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3>Export Passwords</h3>
            <p>Export all your passwords as a CSV file</p>

            <button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export Passwords'}
            </button>
            <p>This will export your passwords in Chrome CSV format</p>
            <p>
              <strong>Security note:</strong> Exported files contain plain text
              passwords. Delete after use.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
