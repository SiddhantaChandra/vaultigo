'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav>
      <ul>
        <li>
          <Link
            href="/dashboard"
            style={{ fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}
          >
            Password Vault
          </Link>
        </li>
        <li>
          <Link
            href="/phishing"
            style={{ fontWeight: isActive('/phishing') ? 'bold' : 'normal' }}
          >
            Phishing Detector
          </Link>
        </li>
        <li>
          <Link
            href="/settings"
            style={{ fontWeight: isActive('/settings') ? 'bold' : 'normal' }}
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
}
