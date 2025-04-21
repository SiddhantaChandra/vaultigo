'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  const navItems = [
    { href: '/dashboard', label: 'Password Vault' },
    { href: '/phishing', label: 'Phishing Detector' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="mb-8 border-b border-dark-border pb-1">
      <ul className="flex space-x-1 overflow-x-auto">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`relative px-4 py-2 inline-block text-sm transition-colors duration-200
                ${
                  isActive(item.href)
                    ? 'text-text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-gradient"></span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
