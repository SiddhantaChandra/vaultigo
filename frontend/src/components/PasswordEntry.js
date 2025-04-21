'use client';

import { useState, useEffect } from 'react';

export default function PasswordEntry({
  password,
  isExpanded,
  onToggleExpand,
  onDelete,
  isDeleting,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const togglePasswordVisibility = (e) => {
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  const copyToClipboard = (text, type) => {
    if (!isClient) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage(`${type} copied!`);
        setTimeout(() => setCopyMessage(''), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        setCopyMessage('Copy failed');
      });
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div
        onClick={onToggleExpand}
        className="flex justify-between items-center cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-md font-medium text-text-primary truncate">
            {password.website}
          </h4>
          <p className="text-sm text-text-secondary truncate">
            {password.username}
          </p>
        </div>
        <button className="ml-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-dark-elevated transition-colors">
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {isExpanded && (
        <div
          className={`mt-4 pt-3 border-t border-dark-border space-y-4 animate-fadeIn`}
        >
          <div>
            <label className="form-label">Username</label>
            <div className="flex items-center bg-dark-surface rounded-md border border-dark-border">
              <span className="flex-1 min-w-0 px-3 py-2 text-text-primary overflow-x-auto scrollbar-hide">
                {password.username}
              </span>
              <button
                onClick={() => copyToClipboard(password.username, 'Username')}
                className="px-3 py-2 text-text-secondary hover:text-purple-400 transition-colors"
                title="Copy username"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="flex items-center bg-dark-surface rounded-md border border-dark-border">
              <span className="flex-1 min-w-0 px-3 py-2 text-text-primary font-mono overflow-x-auto scrollbar-hide">
                {showPassword ? password.password : '••••••••••••••••'}
              </span>
              <button
                onClick={togglePasswordVisibility}
                className="px-3 py-2 text-text-secondary hover:text-purple-400 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                )}
              </button>
              <button
                onClick={() => copyToClipboard(password.password, 'Password')}
                className="px-3 py-2 text-text-secondary hover:text-purple-400 transition-colors"
                title="Copy password"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          {password.notes && (
            <div>
              <label className="form-label">Notes</label>
              <div className="bg-dark-surface p-3 rounded-md border border-dark-border text-text-primary text-sm whitespace-pre-wrap">
                {password.notes}
              </div>
            </div>
          )}

          {copyMessage && (
            <div className="bg-purple-900/20 text-purple-300 text-sm py-2 px-3 rounded-md border border-purple-800/30 transition-opacity animate-fadeIn">
              {copyMessage}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="btn-danger flex items-center text-sm"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Deleting...
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
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
