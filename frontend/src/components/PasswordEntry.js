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
    <div>
      <div onClick={onToggleExpand}>
        <div>
          <h4>{password.website}</h4>
          <p>{password.username}</p>
        </div>
        <button>{isExpanded ? 'Hide' : 'Show'}</button>
      </div>

      {isExpanded && (
        <div>
          <div>
            <label>Username</label>
            <div>
              <span>{password.username}</span>
              <button
                onClick={() => copyToClipboard(password.username, 'Username')}
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label>Password</label>
            <div>
              <span>{showPassword ? password.password : '••••••••'}</span>
              <button onClick={togglePasswordVisibility}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => copyToClipboard(password.password, 'Password')}
              >
                Copy
              </button>
            </div>
          </div>

          {password.notes && (
            <div>
              <label>Notes</label>
              <p>{password.notes}</p>
            </div>
          )}

          {copyMessage && <div>{copyMessage}</div>}

          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
