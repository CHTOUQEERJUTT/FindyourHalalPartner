'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, User, Heart, MessageSquare, Loader2 } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Separator } from "@/app/components/ui/separator"; 
import Link from 'next/link';

// --- Initial Default Filter Values ---
const DEFAULT_FILTERS = {
    gender: 'Male',
    ageMin: 18,
    ageMax: 35,
    interests: [''],
    page: 1,
    limit: 8, 
};

// --- Helper: Build Query String (No changes here) ---
const buildQueryString = (filters) => {
    const params = new URLSearchParams();
    params.append('page', filters.page.toString());
    params.append('limit', filters.limit.toString());
    if (filters.gender) { params.append('gender', filters.gender); }
    if (filters.ageMin) { params.append('ageMin', filters.ageMin.toString()); }
    if (filters.ageMax) { params.append('ageMax', filters.ageMax.toString()); }
    
    if (filters.interests && filters.interests.length > 0) {
        params.append('interests', filters.interests.join(','));
    }
    return params.toString();
};
    
const MatchFinderComponent = () => {
    const router = useRouter()
    const form = useForm({ defaultValues: DEFAULT_FILTERS });
    const formValues = form.watch(); 
    
    const { page, limit, ...filterValues } = formValues; 
    
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // --- RENDER ---
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="container mx-auto px-4 py-12">
                {/* --- Header --- */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Find Your Perfect Match</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Discover meaningful connections with our advanced search and filtering tools.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* --- Filters Sidebar --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                                    <Filter className="mr-3 text-rose-500" />
                                    Filters
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => form.reset(DEFAULT_FILTERS)} className="text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                            
                            <Form {...form}>
                                <form className="space-y-8">
                                    {/* Gender */}
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-medium text-gray-700">I'm looking for a</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 pt-2">
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <RadioGroupItem value="Male" id="male" />
                                                            </FormControl>
                                                            <FormLabel htmlFor="male" className="font-normal text-gray-600">Man</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <RadioGroupItem value="Female" id="female" />
                                                            </FormControl>
                                                            <FormLabel htmlFor="female" className="font-normal text-gray-600">Woman</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    {/* Age Range */}
                                    <div className="space-y-2">
                                         <FormLabel className="text-lg font-medium text-gray-700">Age Range</FormLabel>
                                         <div className="flex items-center space-x-3 pt-2">
                                            <FormField
                                                control={form.control}
                                                name="ageMin"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input type="number" placeholder="Min" {...field} className="text-center" onChange={e => field.onChange(Number(e.target.value))} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <span className="text-gray-500">-</span>
                                            <FormField
                                                control={form.control}
                                                name="ageMax"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input type="number" placeholder="Max" {...field} className="text-center" onChange={e => field.onChange(Number(e.target.value))} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                         </div>
                                    </div>
                                    
                                    <Separator />

                                    {/* Interests */}
                                    <FormField
                                        control={form.control}
                                        name="interests"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-lg font-medium text-gray-700">Interests</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="e.g., traveling, coding, music" 
                                                        {...field}
                                                        onChange={(e) => {
                                                            const interestsArray = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                                                            field.onChange(interestsArray);
                                                        }}
                                                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </div>
                    </div>

                    {/* --- Main Content: User Profiles --- */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center items-center h-96">
                                <Loader2 className="h-12 w-12 text-rose-500 animate-spin" />
                            </div>
                        ) : users.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {users.map((user) => (
                                        <div key={user._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300">
                                            <div className="relative">
                                                 <img src={user.profilePicture || '/default-avatar.png'} alt={`${user.username}'s profile`} className="w-full h-56 object-cover" />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                 <div className="absolute bottom-0 left-0 p-4">
                                                    <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                                                    <p className="text-sm text-rose-200">{user.age} years old</p>
                                                 </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {user.interests.slice(0, 3).map((interest, index) => (
                                                        <span key={index} className="px-3 py-1 text-xs font-semibold text-rose-800 bg-rose-100 rounded-full">{interest}</span>
                                                    ))}
                                                    {user.interests.length > 3 && (
                                                         <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">+{user.interests.length - 3} more</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-5 h-12 overflow-hidden">{user.bio || 'No bio provided.'}</p>
                                                <div className="flex space-x-3">
                                                    <Button onClick={() => router.push(`/viewprofile/${user.username}`)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white transition-colors">
                                                        <User className="mr-2 h-4 w-4" /> View Profile
                                                    </Button>
                                                     <Button onClick={() => router.push(`/sendmessage?recipient=${user.username}`)} variant="outline" className="flex-1 border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                                        <MessageSquare className="mr-2 h-4 w-4" /> Message
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-12 flex justify-center items-center space-x-4">
                                    <Button
                                        onClick={() => form.setValue('page', formValues.page - 1)}
                                        disabled={formValues.page <= 1 || loading}
                                        variant="outline"
                                        className="px-4 py-2"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        <span className="ml-2">Previous</span>
                                    </Button>
                                    <span className="text-lg font-medium text-gray-700">
                                        Page {formValues.page} of {totalPages}
                                    </span>
                                    <Button
                                        onClick={() => form.setValue('page', formValues.page + 1)}
                                        disabled={formValues.page >= totalPages || loading}
                                        variant="outline"
                                        className="px-4 py-2"
                                    >
                                       <span className="mr-2">Next</span>
                                       <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center bg-white rounded-2xl shadow-lg p-12">
                                <Heart className="mx-auto h-16 w-16 text-gray-300" />
                                <h3 className="mt-4 text-2xl font-semibold text-gray-900">No users found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your filters to find more people.</p>
                                <Button onClick={() => form.reset(DEFAULT_FILTERS)} className="mt-6 bg-rose-500 hover:bg-rose-600 text-white">
                                    <RotateCcw className="mr-2 h-4 w-4"/>
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchFinderComponent;