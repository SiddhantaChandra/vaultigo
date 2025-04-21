import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Navigation() {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <nav>
      <ul>
        <li>
          <Link href="/">
            <a>Password Vault</a>
          </Link>
        </li>
        <li>
          <Link href="/add">
            <a>Add Password</a>
          </Link>
        </li>
        <li>
          <Link href="/phishing">
            <a>Phishing Detector</a>
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <a>Settings</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
