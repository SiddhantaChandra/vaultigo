import '@/styles/globals.css';

export const metadata = {
  title: 'Vaultigo Password Manager',
  description: 'Secure client-side encrypted password manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div>
          <header>
            <h1>Vaultigo</h1>
            <p>Secure Password Manager</p>
          </header>
          <main>{children}</main>
          <footer>
            <p>Vaultigo Password Manager - Client-side Encryption</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
