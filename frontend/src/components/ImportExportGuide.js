'use client';

import { useState } from 'react';

export default function ImportExportGuide({ onClose }) {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Import & Export Guide
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-dark-elevated transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('import')}
          className={`relative pb-3 px-4 text-sm font-medium ${
            activeTab === 'import'
              ? 'text-text-accent'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Importing Passwords
          {activeTab === 'import' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`relative pb-3 px-4 text-sm font-medium ${
            activeTab === 'export'
              ? 'text-text-accent'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Exporting Passwords
          {activeTab === 'export' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
          )}
        </button>
      </div>

      {activeTab === 'import' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <span className="p-1.5 rounded-full bg-purple-900/30 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              How to Import Passwords from Chrome
            </h3>

            <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border mb-6">
              <h4 className="text-md font-medium text-text-primary mb-3">
                Step 1: Export your passwords from Chrome
              </h4>
              <ol className="space-y-2 text-text-secondary ml-6 list-decimal">
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
            </div>

            <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border mb-6">
              <h4 className="text-md font-medium text-text-primary mb-3">
                Step 2: Import into Vaultigo
              </h4>
              <ol className="space-y-2 text-text-secondary ml-6 list-decimal">
                <li>Go to the Settings page in Vaultigo</li>
                <li>Find the "Import & Export" section</li>
                <li>
                  Click "Choose File" and select the CSV file you exported from
                  Chrome
                </li>
                <li>Wait for the import to complete</li>
              </ol>
            </div>

            <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border">
              <h4 className="text-md font-medium text-text-primary mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Important Notes
              </h4>
              <ul className="space-y-2 text-text-secondary ml-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    All your passwords will be encrypted with your Vaultigo
                    master password
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
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    The import process happens entirely on your device - your
                    passwords are never sent to our servers in plain text
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
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    After importing, consider deleting the CSV file from your
                    computer for security
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
              <span className="p-1.5 rounded-full bg-purple-900/30 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              How to Export Passwords from Vaultigo
            </h3>

            <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border mb-6">
              <h4 className="text-md font-medium text-text-primary mb-3">
                Export Process
              </h4>
              <ol className="space-y-2 text-text-secondary ml-6 list-decimal">
                <li>Go to the Settings page in Vaultigo</li>
                <li>Find the "Import & Export" section</li>
                <li>Click the "Export Passwords" button</li>
                <li>Choose where to save your CSV file</li>
              </ol>
            </div>

            <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
              <h4 className="text-md font-medium text-red-300 mb-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Security Warning
              </h4>
              <p className="text-red-200 mb-3">
                The exported CSV file will contain all your passwords in plain
                text. Handle this file with extreme care:
              </p>
              <ul className="space-y-2 text-red-200/80 ml-2">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Only save it to a secure location</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Delete the file immediately after use</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Never share this file with anyone</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Consider encrypting the file if you need to store it
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          onClick={onClose}
          className="btn-secondary flex items-center text-sm"
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
          Close Guide
        </button>
      </div>
    </div>
  );
}
