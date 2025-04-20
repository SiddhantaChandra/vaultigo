'use client';

import { useState, useEffect } from 'react';
import PasswordEntry from './PasswordEntry';
import { deletePasswordEntry } from '@/lib/supabase';

export default function PasswordList({ passwords, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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
      setIsDeleting(true);
      try {
        await deletePasswordEntry(id);
        onDelete(id);
      } catch (error) {
        console.error('Error deleting password:', error);
        alert('Failed to delete password. Please try again.');
      } finally {
        setIsDeleting(false);
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
    <div>
      <div>
        <input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPasswords.length === 0 ? (
        <p>No passwords match your search.</p>
      ) : (
        <ul>
          {filteredPasswords.map((password) => (
            <li key={password.id}>
              <PasswordEntry
                password={password}
                isExpanded={expandedId === password.id}
                onToggleExpand={() => handleToggleExpand(password.id)}
                onDelete={() => handleDelete(password.id)}
                isDeleting={isDeleting}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
