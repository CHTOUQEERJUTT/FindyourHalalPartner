'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Calendar, User, Heart, Star, Send, Twitter, Facebook, Instagram, Linkedin, Link, Loader2 } from 'lucide-react';

// --- Assuming these shadcn/ui components are correctly imported ---
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Button } from "@/app/components/ui/button";

// --- Type Definitions based on MongoDB Schema ---
// NOTE: SocialLinks type is now an array of strings to match your DB
type SocialLinksArray = string[];

type UserType = {
  username: string;
  gender: string;
  age: number;
  cast?: string;
  interests?: string[]; 
  image?: string;
  email?: string; 
  joiningDate?: string; 
  bio?: string;
  socialLinks?: SocialLinksArray; // 🛑 CHANGED: Expects an array of string URLs
  isAcceptingMessages?: boolean;
};

// Define a map for icons (used in the new rendering logic)
interface IconMap {
    [key: string]: ReactNode;
}

const socialIconMap: IconMap = {
    instagram: <Instagram className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
};

// --- Props for DetailItem component ---
interface DetailItemProps {
  icon: ReactNode; 
  label: string;
  value: string | number | undefined | null;
}


export default function ViewProfilePage() {
  const router = useRouter(); 
  const params = useParams();
  const rawUsername = Array.isArray(params.username) ? params.username[0] : params.username;
  const username = typeof rawUsername === 'string' ? decodeURIComponent(rawUsername) : null;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof username !== 'string' || !username) {
        setError("Invalid profile link or username.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);

    // --- Fetch Real User Data Directly ---
    axios
      .get(`/api/user?username=${encodeURIComponent(username)}`)
      .then((res) => {
        if (res.data.success && res.data.user) {
            const apiUser: UserType = res.data.user;
            
            // Ensure joiningDate is pulled from createdAt
            if (!apiUser.joiningDate && res.data.user.createdAt) {
                // Handle both Mongoose (object) and direct date string formats
                apiUser.joiningDate = res.data.user.createdAt['$date'] || res.data.user.createdAt;
            }
            setUser(apiUser);
        } else {
            setError(res.data.message || `User '${username}' not found.`);
            setUser(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again.");
        setUser(null); 
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  // Handler for the "Ready to Connect" button
  const handleConnect = () => {
    if (user?.username) {
      router.push(`/sendmessage?recipient=${encodeURIComponent(user.username)}`);
    }
  };

  // --- Loading and Error States ---
  if (isLoading) {
      return (
          <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <p className="text-xl text-blue-600">Loading profile for {username}...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="p-6 text-center text-red-600 bg-red-100 border border-red-300 rounded-lg max-w-lg mx-auto mt-10">
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p>{error}</p>
          </div>
      );
  }

  if (!user) {
      return <div className="p-6 text-center text-gray-500">Profile data is unavailable.</div>;
  }

  // --- Helper Functions ---
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  /**
   * Helper function to determine platform name (e.g., 'instagram') from a full URL.
   * This is necessary because the DB stores a URL array, not a key/value object.
   */
  const getPlatformFromUrl = (url: string) => {
      if (url.includes('instagram.com')) return 'instagram';
      if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
      if (url.includes('facebook.com')) return 'facebook';
      if (url.includes('linkedin.com')) return 'linkedin';
      return null;
  };
  
  // Check if socialLinks is an array and has items
  const hasSocialLinks = Array.isArray(user.socialLinks) && user.socialLinks.length > 0;
  
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      <Card className="max-w-4xl mx-auto shadow-2xl border-t-4 border-blue-500">
        
        {/* Profile Header and Basic Info */}
        <CardHeader className="p-8 bg-white/90 rounded-t-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            
            <Avatar className="w-32 h-32 border-4 border-blue-500 shadow-md">
              <AvatarImage src={user.image} alt={user.username} onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/3B82F6/ffffff?text=' + getInitials(user.username) }}/>
              <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-extrabold">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <CardTitle className="text-4xl font-extrabold text-gray-900 mb-1">
                {user.username}
              </CardTitle>
              <CardDescription className="text-xl text-purple-600 font-semibold mb-3">
                {user.cast || 'Cast Not Specified'}
              </CardDescription>
              
              <div className="mt-4">
                {/* READY TO CONNECT BUTTON (Redirects to sendmessage page) */}
                {user.isAcceptingMessages !== false ? (
                    <Button 
                        onClick={handleConnect} 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 flex items-center"
                    >
                        <Send className="h-5 w-5 mr-2" /> Ready to Connect!
                    </Button>
                ) : (
                    <Badge variant="destructive" className="bg-gray-400 text-white px-4 py-2 text-base">
                        Messages Disabled
                    </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <Separator className="bg-gray-200" />

        {/* Profile Body Content */}
        <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Basic Details & Socials (Column 1) */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center"><User className="mr-2 h-5 w-5"/> Vitals</h2>
            <DetailItem icon={<User className="h-5 w-5 text-purple-500"/>} label="Gender" value={user.gender} />
            <DetailItem icon={<Calendar className="h-5 w-5 text-purple-500"/>} label="Age" value={`${user.age} years`} />
            {user.email && <DetailItem icon={<Mail className="h-5 w-5 text-purple-500"/>} label="Email" value={user.email} />}
            {user.joiningDate && <DetailItem icon={<Calendar className="h-5 w-5 text-purple-500"/>} label="Joined On" value={new Date(user.joiningDate).toLocaleDateString()} />}

            {/* SOCIAL LINKS SECTION: NOW HANDLES ARRAY OF URLs */}
            {hasSocialLinks && (
                <>
                <Separator className="my-6" />
                <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center"><Link className="mr-2 h-5 w-5"/> Socials</h2>
                <div className="flex flex-wrap gap-3">
                    {/* Iterate over the array of URLs */}
                    {user.socialLinks!.map((url, index) => {
                        const platform = getPlatformFromUrl(url);
                        
                        // Only render if we successfully identified the platform
                        if (!platform) return null;
                        
                        const icon = socialIconMap[platform];

                        return (
                            <a 
                                key={index} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white transition duration-200 shadow-md"
                                title={`View on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                            >
                                {icon}
                            </a>
                        );
                    })}
                </div>
                </>
            )}
          </div>
          
          {/* Section 2: Bio and Description & Interests (Column 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center"><Star className="mr-2 h-5 w-5"/> About Me</h2>
            <p className="text-gray-700 leading-relaxed italic border-l-4 border-purple-300 pl-4 py-2 bg-purple-50 rounded-md">
              {user.bio || 'This user has not provided a biography yet.'}
            </p>
            
            <Separator className="my-6" />

            {/* Interests Section */}
            <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center"><Heart className="mr-2 h-5 w-5"/> Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests && user.interests.length > 0 ? (
                user.interests.map((interest) => (
                  <Badge key={interest} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-base shadow-sm">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No interests listed.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Component for consistent detail presentation ---
const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
    <div className="shrink-0 text-blue-500">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
      <span className="text-base font-semibold text-gray-800">{value}</span>
    </div>
  </div>
);