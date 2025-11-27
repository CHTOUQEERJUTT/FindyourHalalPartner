"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { Input } from "@/app/components/ui/input";

import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/components/ui/select";
import { Loader2, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [preview, setPreview] = useState(null);
  const [initialData, setInitialData] = useState(null); 
  const [isLoadingFetch, setIsLoadingFetch] = useState(true); // Separate loading state for fetch

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      username: "",
      bio: "",
      gender: "",
      cast: "",
      age: "",
      socialLinks: "",
      interests: "",
      image: null,
    },
  });

  // Fetch initial profile data (Implementation for the GET handler)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;
      
      try {
        const response = await axios.get("/api/profile");
        const userData = response.data.user;
        setInitialData(userData);
        
        // Format data for form: convert array to comma-separated string
        const formattedData = {
          ...userData,
          // Ensure arrays are treated safely before joining
          socialLinks: userData.socialLinks ? userData.socialLinks.join(", ") : "",
          interests: userData.interests ? userData.interests.join(", ") : "",
          age: userData.age || "",
        };

        // Reset the form with fetched data
        reset(formattedData);
        if (userData.image) {
          setPreview(userData.image);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Could not load current profile data.");
      } finally {
        setIsLoadingFetch(false);
      }
    };

    if (session) {
      fetchProfile();
    } else {
        setIsLoadingFetch(false);
    }
  }, [session, reset]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // This is needed because RHF register for files only updates the file list
    // It doesn't handle the UI preview, so we handle that manually
    
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else if (initialData?.image) {
        // If file input is cleared but there was an existing image, show the existing one
        setPreview(initialData.image);
    } else {
        setPreview(null);
    }
  };
  
  // Custom setter for Select component (since it doesn't use the standard onChange event)
  const handleSelectChange = (name, value) => {
    setValue(name, value, { shouldValidate: true, shouldDirty: true });
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append all fields, correctly handling the file
      for (const key in data) {
        if (key === "image" && data.image?.[0]) {
          // Append the File object
          formData.append("image", data.image[0]);
        } else if (key !== "image") {
          // Append other fields
          formData.append(key, data[key] || ""); 
        }
      }
      
      // MOCK: If no new image is selected but there was one initially, ensure its URL is sent back if your API expects it
      if (data.image?.length === 0 && initialData?.image) {
        // You might need a way to tell the backend to retain the existing image if no new one is provided
        // For simplicity here, we assume the backend retains it unless 'image' field is explicitly set to null/empty
      }

      const res = await axios.patch("/api/profile", formData);

      if (res.data.success) {
        toast.success("Profile updated successfully! 🎉");
        await update(); // Refresh session data
        
        // Update initial data state and preview
        const updatedUser = res.data.user;
        setInitialData(updatedUser);
        if (updatedUser.image) {
          setPreview(updatedUser.image);
        }
      } else {
        toast.error(res.data.message || "Update failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating.");
    }
  };
  
  if (isLoadingFetch) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
              <Loader2 className="h-8 w-8 animate-spin text-[#55efc4]" />
              <p className="ml-2 text-gray-600 font-medium">Loading profile...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <Toaster richColors theme="light" />
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-xl shadow-2xl border border-gray-200 space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center border-b pb-4">
                Update Your Profile
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* --------------------- PROFILE IMAGE SECTION --------------------- */}
                <div className="flex flex-col items-center space-y-4 pb-4 border-b">
                    <Label className="text-xl font-semibold text-gray-700">Profile Photo</Label>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg flex items-center justify-center bg-gray-100">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-16 h-16 text-gray-500" />
                        )}
                    </div>
                    <Input 
                        id="image"
                        type="file" 
                        accept="image/*" 
                        {...register("image")} 
                        onChange={handleImageChange} 
                        className="max-w-xs text-sm file:text-white file:bg-[#55efc4] file:border-none file:rounded-md file:hover:bg-[#48d9b0] file:cursor-pointer transition-colors border-gray-300"
                    />
                </div>

                {/* --------------------- INPUT FIELDS GRID --------------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                        <Label htmlFor="username" className="font-medium text-gray-700">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            {...register("username", { required: true })}
                            className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <Label className="font-medium text-gray-700">Gender</Label>
                        <Select
                            onValueChange={(value) => handleSelectChange("gender", value)}
                            defaultValue={initialData?.gender} 
                        >
                            <SelectTrigger className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] text-gray-800 transition-colors">
                                <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("gender")} />
                    </div>
                    
                    {/* Cast */}
                    <div>
                        <Label htmlFor="cast" className="font-medium text-gray-700">Cast / Ethnicity</Label>
                        <Input
                            id="cast"
                            type="text"
                            placeholder="e.g. Sunni, Shia, Malik"
                            {...register("cast")}
                            className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                        />
                    </div>

                    {/* Age */}
                    <div>
                        <Label htmlFor="age" className="font-medium text-gray-700">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            placeholder="Enter your age"
                            {...register("age")}
                            className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                        />
                    </div>
                </div>

                {/* --------------------- FULL WIDTH FIELDS --------------------- */}
                
                {/* Bio */}
                <div>
                    <Label htmlFor="bio" className="font-medium text-gray-700">Bio (Tell us about yourself)</Label>
                    <Textarea
                        id="bio"
                        placeholder="Write something sincere about yourself, your goals, and what you seek in a partner."
                        {...register("bio")}
                        rows={4}
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                </div>
                
                {/* Interests */}
                <div>
                    <Label htmlFor="interests" className="font-medium text-gray-700">Interests (comma-separated)</Label>
                    <Input
                        id="interests"
                        type="text"
                        placeholder="e.g. Reading Quran, Charity, Hiking, Cooking"
                        {...register("interests")}
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate each interest with a comma.</p>
                </div>

                {/* Social Links */}
                <div>
                    <Label htmlFor="socialLinks" className="font-medium text-gray-700">Social Links (comma-separated, optional)</Label>
                    <Input
                        id="socialLinks"
                        type="text"
                        placeholder="https://instagram.com/user, https://linkedin.com/in/user"
                        {...register("socialLinks")}
                        className="mt-1 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Provide links only if you are comfortable sharing.</p>
                </div>

                {/* --------------------- SUBMIT BUTTON --------------------- */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    // Primary Button Style: Mint green background, black text
                    className="w-full font-semibold bg-[#55efc4] text-black rounded-lg py-2.5 hover:bg-[#48d9b0] shadow-md transition-all disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Changes...
                        </>
                    ) : (
                        'Update Profile'
                    )}
                </Button>
            </form>
        </div>
    </div>
  );
}
