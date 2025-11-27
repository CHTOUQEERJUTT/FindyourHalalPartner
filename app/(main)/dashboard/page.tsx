'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, User, Heart, MessageSquare, Loader2 } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar,AvatarFallback,AvatarImage } from '@/app/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface Message {
  _id: string;
  // Sender can be a populated object, a plain string ID, or null/undefined
  sender: { username?: string } | string | null | undefined; 
  content: string;
  createdAt: string;
}

interface UserProfile {
  username: string;
  bio?: string;
  gender?: string;
  cast?: string;
  age?: number;
  interests?: string[];
  image?: string;
  messages?: Message[];
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/profile', { withCredentials: true });
        setUserData(response.data.user);
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        
        if (error?.response?.status === 401) {
            router.replace('/signin');
            return; 
        }
        
        const errorMessage = "Failed to load profile data. Please check the server.";
        setError(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#55efc4]" />
        <p className="ml-2 text-gray-600 font-medium">Loading Dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="p-8 rounded-xl bg-white shadow-lg border border-red-300 text-center">
          <p className="text-xl font-semibold text-red-600 mb-2">Error Accessing Profile</p>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );

  if (!userData) {
      router.replace('/signin');
      return null;
  }

  const user = userData;
  const messages = user.messages || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Hi there ! <span className="text-[#55efc4]">{user.username}!</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
              <div className="flex justify-center mb-4">
                <Avatar className="w-28 h-28 border-4 border-[#55efc4] shadow-md">
                  <AvatarImage src={user.image} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-2xl font-bold text-center text-black ">{user.username}</h2>
              <p className="text-sm text-black  text-center mb-4 font-medium">
                {user.age} yrs | {user.cast}
              </p>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-sm text-gray-700 font-medium mb-2">My Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {(user.interests || []).map((interest, i) => ( 
                    <span
                      key={i} 
                      className="text-xs font-semibold px-3 py-1 bg-[#55efc4]/20 text-gray-800 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => router.push('/updateprofile')}
                className="w-full mt-6 py-2.5 text-base font-semibold bg-[#55efc4] text-black rounded-lg hover:bg-[#48d9b0] transition-colors shadow-md"
              >
                View/Edit Profile
              </button>
            </div>
          </div>

          {/* Center: Messages */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center mb-6">
                <MessageSquare className="h-6 w-6 text-[#55efc4] mr-3" />
                Latest Messages
                <span className="ml-auto text-sm font-bold text-black bg-[#55efc4] px-3 py-1 rounded-full">
                  {messages.length}
                </span>
              </h2>

              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    
                    // FINAL FIX: SAFELY DETERMINE SENDER NAME
                    const senderName = 
                       (msg.sender && typeof msg.sender === 'object' 
                          ? msg.sender.username // Populated object: use username
                          : (typeof msg.sender === 'string' 
                            ? msg.sender // String ID (or unpopulated string): use the string
                            : 'Deleted User / System Message' // Fallback for null/undefined sender
                            )
                        );
                        
                    return (
                    <div
                      key={msg.createdAt}
 
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-shadow cursor-pointer shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">
                          {senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{msg.content}</p>
                    </div>
                  )})}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8 text-lg">
                  <Mail className="h-6 w-6 inline-block mr-2 text-gray-400" />
                  No new messages.
                </p>
              )}
            </div>
          </div>

          {/* Right Sidebar (keep your static suggestions) */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}