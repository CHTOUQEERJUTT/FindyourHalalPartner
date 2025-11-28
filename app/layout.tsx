// /app/layout.tsx

import NavBar from '@/app/components/NavBar'; // Adjust path if necessary
import { Providers } from './providers'; // Example of wrapping with context/auth
import './globals.css'; // Global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* The Providers component should include your NextAuth SessionProvider */}
        <Providers> 
          
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}