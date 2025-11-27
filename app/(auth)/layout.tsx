// /app/(auth)/layout.tsx

// Import the NavBar component
import NavBar from '../components/NavBar';
import React from 'react';

// Define the expected props for the layout component
interface AuthLayoutProps {
  children: React.ReactNode;
}

// 1. MUST be a function that accepts props (including children).
// 2. MUST have 'export default'.
// 3. MUST return JSX.

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // The NavBar will show the "Sign In" / "Sign Up" links when on this route group
    <div>
      <NavBar />
      <main>
        {children}
      </main>
    </div>
  )
}

// Optional: Metadata for all pages in the (auth) group
// export const metadata = {
//   title: 'Authentication',
//   description: 'Sign In or Sign Up for the dating app.',
// };