// /app/(main)/layout.tsx

import NavBar from '../components/NavBar';// Assuming NavBar.tsx is in components
import React from 'react';

// Define the expected props for the layout component
interface MainLayoutProps {
  children: React.ReactNode;
}

// 1. MUST be a function that accepts props (including children).
// 2. MUST have 'export default'.
// 3. MUST return JSX.

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    // This wrapper applies the NavBar to all main pages
    <div>
      <NavBar />
      <main>
        {children}
      </main>
    </div>
  );
}

// Optional: Metadata for all pages in the (main) group
// export const metadata = {
//   title: 'App Dashboard',
//   description: 'Authenticated area for the dating app.',
// };