import '@/styles/globals.css';
import Image from 'next/image';

export const metadata = {
  title: 'Vaultigo Password Manager',
  description: 'Secure client-side encrypted password manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-background text-text-primary min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 bg-dark-elevated z-10 border-b border-dark-border shadow-md">
            <div className="container mx-auto py-4 px-6 flex justify-center items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <div className="absolute inset-0 bg-purple-gradient rounded-full"></div>
                  <div className="absolute inset-1 bg-dark-background rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-purple-gradient">
                      V
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-white">Vault</span>
                  <span className="text-transparent bg-clip-text bg-purple-gradient">
                    igo
                  </span>
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-grow pt-20 pb-10">
            <div className="container-app">{children}</div>
          </main>

          <footer className="bg-dark-elevated border-t border-dark-border py-4">
            <div className="container mx-auto px-6 text-center text-text-secondary text-sm">
              <p>Vaultigo Password Manager &copy; {new Date().getFullYear()}</p>
              <p className="text-xs mt-1">
                Your passwords are encrypted locally on your device
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
