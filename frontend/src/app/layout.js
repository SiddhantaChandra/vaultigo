import '@/styles/globals.css';
import Image from 'next/image';
import LogoWhie from '@/../public/logo-t-white.webp';

export const metadata = {
  title: 'Vaultigo Password Manager',
  description: 'Secure client-side encrypted password manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="pt-24">
        <div className="grow-1 flex flex-col justify-center items-center">
          <header className="">
            <Image
              src={LogoWhie}
              alt="Vaultigo Logo"
              width={250}
              height={200}
              priority
            />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
