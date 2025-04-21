'use client';

import { useState } from 'react';

export default function ImportExportGuide({ onClose }) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <div>
      <div>
        <button onClick={() => setActiveTab('import')}>
          Importing Passwords
        </button>
        <button onClick={() => setActiveTab('export')}>
          Exporting Passwords
        </button>
        <button onClick={onClose}>Close</button>
      </div>

      {activeTab === 'import' ? (
        <div>
          <h2>How to Import Passwords from Chrome</h2>

          <h3>Step 1: Export your passwords from Chrome</h3>
          <ol>
            <li>Open Google Chrome</li>
            <li>Click the three dots (⋮) in the top-right corner</li>
            <li>Go to Settings</li>
            <li>Click on "Autofill" in the left sidebar</li>
            <li>Select "Passwords"</li>
            <li>Click the three dots (⋮) next to "Saved Passwords"</li>
            <li>Select "Export passwords"</li>
            <li>Confirm with your computer password if prompted</li>
            <li>Choose a location to save the CSV file</li>
          </ol>

          <h3>Step 2: Import into Vaultigo</h3>
          <ol>
            <li>Go to the Settings page in Vaultigo</li>
            <li>Find the "Import & Export" section</li>
            <li>
              Click "Choose File" and select the CSV file you exported from
              Chrome
            </li>
            <li>Wait for the import to complete</li>
          </ol>

          <h3>Important Notes</h3>
          <ul>
            <li>
              All your passwords will be encrypted with your Vaultigo master
              password
            </li>
            <li>
              The import process happens entirely on your device - your
              passwords are never sent to our servers in plain text
            </li>
            <li>
              After importing, consider deleting the CSV file from your computer
              for security
            </li>
          </ul>
        </div>
      ) : (
        <div>
          <h2>How to Export Passwords from Vaultigo</h2>

          <h3>Export Process</h3>
          <ol>
            <li>Go to the Settings page in Vaultigo</li>
            <li>Find the "Import & Export" section</li>
            <li>Click the "Export Passwords" button</li>
            <li>Choose where to save your CSV file</li>
          </ol>

          <h3>Security Warning</h3>
          <p>
            The exported CSV file will contain all your passwords in plain text.
            Handle this file with extreme care:
          </p>
          <ul>
            <li>Only save it to a secure location</li>
            <li>Delete the file immediately after use</li>
            <li>Never share this file with anyone</li>
            <li>Consider encrypting the file if you need to store it</li>
          </ul>
        </div>
      )}
    </div>
  );
}
