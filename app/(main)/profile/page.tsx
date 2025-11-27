'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { toast, Toaster } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Link, Heart, User } from 'lucide-react'

interface UserProfile {
  username?: string
  bio?: string
  gender?: string
  cast?: string
  age?: number
  interests?: string[]
  socialLinks?: string[]
  image?: string
}

function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const { data: session } = useSession()

  // --- MOCK DATA FOR DEVELOPMENT ---
  const mockProfile: UserProfile = {
      username: "Ayesha_24",
      bio: "Seeking a sincere and God-fearing partner for a beautiful life journey. Loves reading and charity work, committed to Deen.",
      gender: "Female",
      cast: "Syed",
      age: 26,
      interests: ["Reading Quran", "Charity Work", "Cooking", "Hiking"],
      socialLinks: ["https://instagram.com/ayesha_m", "https://linkedin.com/in/ayesha"],
      image: "https://placehold.co/128x128/95ecbe/000?text=A", 
  }
  // --- END MOCK DATA ---

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      // Optional: Use mock data during development if API is failing
      if (false) { // Set to true to test design without API
        await new Promise(resolve => setTimeout(resolve, 500));
        setUserData(mockProfile);
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await axios.get('/api/profile', { withCredentials: true })
        setUserData(res.data.user)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to fetch profile data.')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
        fetchProfile()
    } else {
        setIsLoading(false); // If no session, stop loading
    }
  }, [session])

  // Use optional chaining for safe access
  const usernameInitial = userData?.username?.[0]?.toUpperCase() || 'U';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Toaster richColors theme="light" />
        <Card className="max-w-md w-full shadow-xl border border-gray-100 p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full bg-gray-200" />
            <div className="space-y-2 w-full text-center">
              <Skeleton className="h-6 w-1/2 mx-auto bg-gray-200" />
              <Skeleton className="h-4 w-2/3 mx-auto bg-gray-200" />
            </div>
          </div>
          <Separator className="bg-gray-200" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-5/6 bg-gray-200" />
            <Skeleton className="h-4 w-4/5 bg-gray-200" />
            <Skeleton className="h-4 w-3/4 bg-gray-200" />
          </div>
        </Card>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600">
        <p className="text-xl font-medium flex items-center p-8 bg-white rounded-xl shadow-lg">
          <User className="h-6 w-6 mr-3 text-gray-400" />
          No profile data found.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <Toaster richColors theme="light" />
      <Card className="max-w-md w-full shadow-2xl border border-gray-100 rounded-xl">
        
        {/* Profile Header and Avatar */}
        <CardHeader className="flex flex-col items-center text-center p-8 bg-[#55efc4]/10 rounded-t-xl">
          <Avatar className="h-24 w-24 border-4 border-[#55efc4] shadow-md">
            <AvatarImage src={userData.image || ''} alt={userData.username} />
            <AvatarFallback className="bg-[#55efc4] text-white text-3xl font-bold">{usernameInitial}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            {userData.username}
          </CardTitle>
          <p className="text-gray-600 text-base mt-2 font-medium italic">
            "{userData.bio || 'No bio added yet.'}"
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          
          {/* Details Section */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            
            <div className="flex flex-col">
                <span className="font-bold text-gray-700">Gender</span>
                <span className="text-gray-900 mt-0.5">{userData.gender || '—'}</span>
            </div>
            
            <div className="flex flex-col">
                <span className="font-bold text-gray-700">Age</span>
                <span className="text-gray-900 mt-0.5">{userData.age || '—'}</span>
            </div>
            
            <div className="flex flex-col col-span-2">
                <span className="font-bold text-gray-700">Cast / Ethnicity</span>
                <span className="text-gray-900 mt-0.5">{userData.cast || '—'}</span>
            </div>

          </div>

          <Separator className="bg-gray-200" />

          {/* Interests Section */}
          <div>
            <span className="font-bold text-gray-700 flex items-center mb-2">
                <Heart className="h-4 w-4 text-[#55efc4] mr-2" fill="#55efc4" />
                Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {userData.interests?.length ? (
                  userData.interests.map((interest, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-semibold px-3 py-1 bg-[#55efc4]/20 text-gray-800 rounded-full shadow-sm"
                    >
                      {interest}
                    </span>
                  ))
              ) : (
                <span className="text-gray-500 italic">None specified.</span>
              )}
            </div>
          </div>
          
          {/* Social Links Section */}
          <div>
            <span className="font-bold text-gray-700 flex items-center mb-2">
                <Link className="h-4 w-4 text-blue-500 mr-2" />
                Social Links
            </span>
            <div className="space-y-2">
              {userData.socialLinks?.length ? (
                  userData.socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 font-medium hover:text-[#55efc4] transition-colors flex items-center overflow-hidden whitespace-nowrap text-ellipsis"
                    >
                      {link}
                    </a>
                  ))
              ) : (
                <span className="text-gray-500 italic">Not shared.</span>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
