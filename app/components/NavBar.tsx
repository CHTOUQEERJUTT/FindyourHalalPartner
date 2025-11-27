// /components/NavBar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { LogOut, User, LayoutDashboard, Send, Eye, PenTool } from 'lucide-react'
import { Avatar,AvatarFallback,AvatarImage } from './ui/avatar'

// Define the navigation links for authenticated users
const mainLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/', label: 'Find Matches', icon: Eye },
  { href: '/updateprofile', label: 'Edit Profile', icon: PenTool },
  
]

// Define the navigation links for unauthenticated users (Auth Pages)
const authLinks = [
  { href: '/signin', label: 'Sign In' },
  { href: '/signup', label: 'Sign Up' },
]

export default function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Determine if the user is on an auth-related page
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup') || pathname.startsWith('/verificationCodeValidation') || pathname === '/'

  // Determine which links to show
  const navLinks = isAuthPage ? authLinks : mainLinks

  // Utility function to determine if a link is active
  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== '/')

  const brandName = 'Find Your Halal Partner'
  const brandColor = '#55efc4'

  return (
    // NavBar container: Fixed at the top, white background, subtle shadow
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href={session ? '/dashboard' : '/'} className="text-2xl font-extrabold" style={{ color: brandColor }}>
              {brandName}
            </Link>
          </div>

          {/* Navigation Links (Based on context) */}
          <div className="hidden md:flex md:space-x-4 items-center">
            {/* 1. Unauthenticated/Auth pages (Show Sign In/Sign Up) */}
            {!session && isAuthPage && (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      text-base font-semibold px-3 py-2 rounded-md transition-colors
                      ${isActive(link.href)
                        ? 'bg-gray-100 text-gray-900' // Active tab style
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900' // Inactive tab style
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* 2. Authenticated/Main pages (Show Dashboard links, hide active page) */}
            {session && !isAuthPage && (
              <>
                {mainLinks.map((link) => (
                  !isActive(link.href) && ( // Hide the active page link
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-base font-semibold px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                ))}
              </>
            )}
          </div>

          {/* Right side: User Profile / Sign Out / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {status === 'authenticated' && session.user ? (
              // User is signed in
              <>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.username} />
                    <AvatarFallback className="bg-[#55efc4] text-black font-bold">
                      {(session.user.username || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">{session.user.username}</span>
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              // User is not signed in or loading (show sign in button if not on an auth page for mobile/other routes)
              !isAuthPage && status !== 'loading' && (
                <Button
                  asChild
                  // Mint button style
                  className="font-semibold bg-[#55efc4] text-black hover:bg-[#48d9b0] transition-colors shadow-md"
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
              )
            )}
            
            {/* Mobile menu button (can be implemented later) */}
            <div className="md:hidden">
              <Button variant="ghost" className="p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}