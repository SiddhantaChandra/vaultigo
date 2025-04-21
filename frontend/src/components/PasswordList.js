'use client';

import { useState, useEffect } from 'react';
import PasswordEntry from './PasswordEntry';
import { deletePasswordEntry } from '@/lib/supabase';

export default function PasswordList({ passwords, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (!isClient) return;

    if (
      window.confirm(
        'Are you sure you want to delete this password? This action cannot be undone.',
      )
    ) {
      setDeletingId(id);
      try {
        await deletePasswordEntry(id);
        onDelete(id);
      } catch (error) {
        console.error('Error deleting password:', error);
        alert('Failed to delete password. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredPasswords = searchTerm
    ? passwords.filter(
        (password) =>
          password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
          password.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : passwords;

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {filteredPasswords.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex rounded-full bg-dark-elevated p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-4 text-text-secondary">
            No passwords match your search.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPasswords.map((password) => (
            <PasswordEntry
              key={password.id}
              password={password}
              isExpanded={expandedId === password.id}
              onToggleExpand={() => handleToggleExpand(password.id)}
              onDelete={() => handleDelete(password.id)}
              isDeleting={deletingId === password.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
