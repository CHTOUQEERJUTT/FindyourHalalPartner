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
    
    const prevFiltersRef = useRef(JSON.stringify(filterValues));
    const debounceTimerRef = useRef(null);
    const isMountedRef = useRef(false);

    // --- EFFECT 1: Reset Page on Filter Change ---
    useEffect(() => {
        const currentFiltersStr = JSON.stringify(filterValues);
        
        if (prevFiltersRef.current !== currentFiltersStr) {
            prevFiltersRef.current = currentFiltersStr;
            
            if (formValues.page !== 1) {
                form.setValue('page', 1, { shouldValidate: false });
            }
        }
    }, [filterValues, form, formValues.page]);

    // --- EFFECT 2: Debounced API Call ---
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!isMountedRef.current) {
            isMountedRef.current = true;
            
            const fetchData = async () => {
                setLoading(true);
                const queryString = buildQueryString(formValues);
                console.log(`FETCHING DATA: ${queryString}`);

                try {
                    const response = await axios.get(`/api/users/?${queryString}`);
                    setUsers(response.data.users || []);
                    setTotalPages(response.data.totalPages || 1);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    setUsers([]);
                    setTotalPages(1);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchData();
            return;
        }

        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            const queryString = buildQueryString(formValues);
            console.log(`FETCHING DATA: ${queryString}`);

            try {
                const response = await axios.get(`/api/users/?${queryString}`);
                setUsers(response.data.users || []);
                setTotalPages(response.data.totalPages || 1);
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [formValues.page, formValues.limit, formValues.gender, formValues.ageMin, formValues.ageMax, JSON.stringify(formValues.interests)]);

    // --- Handlers ---
    const handleReset = () => {
        form.reset(DEFAULT_FILTERS);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            form.setValue('page', newPage);
        }
    };

    // --- Rendering Functions ---

    const renderInterestsCheckboxes = () => {
        const availableInterests = ['cricket', 'football', 'sport', 'reading', 'travel', 'cooking', 'movies', 'music'];
        return availableInterests.map((interest) => (
            <FormField
                key={interest}
                control={form.control}
                name="interests"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value.includes(interest)}
                                onCheckedChange={(checked) => {
                                    const newInterests = checked
                                        ? [...field.value, interest]
                                        : field.value.filter((i) => i !== interest);
                                    field.onChange(newInterests);
                                }}
                                className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                            />
                        </FormControl>
                        {/* Visibility Fix: Changed text color to black */}
                        <FormLabel className="font-normal text-sm cursor-pointer whitespace-nowrap text-black">{interest}</FormLabel>
                    </FormItem>
                )}
            />
        ));
    };

    const renderUserCards = () => {
        
        if (loading) {
            return (
                <div className="md:col-span-3 text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <span className="text-blue-600 font-semibold">Fetching compatible partners...</span>
                </div>
            );
        }
        if (users.length === 0) {
            return <div className="md:col-span-3 text-center py-20 text-gray-500 text-lg">😔 No users found matching your criteria. Try adjusting the filters.</div>;
        }

        // REDESIGNED CARD LAYOUT
        return users.map(user => (
            <div 
                key={user._id} 
                className="bg-white p-6 shadow-xl rounded-2xl flex flex-col items-center text-center border-t-4 border-blue-500 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
            >
                {/* Image and Avatar */}
                <div className="relative mb-4">
                    <img
                        src={user.image || `https://placehold.co/128x128/E0F2F1/042F2E?text=${user.username.charAt(0)}`}
                        alt={user.username}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/128x128/E0F2F1/042F2E?text=${user.username.charAt(0)}`; }}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-blue-400"
                    />
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                        {user.age || 'N/A'} yrs
                    </div>
                </div>

                {/* Name and Details */}
                <h3 className="font-extrabold text-2xl text-gray-900 truncate max-w-full">{user.username}</h3>
                <p className="text-md font-medium text-purple-600 mb-2">
                    {user.gender} | **{user.cast || 'Match'}**
                </p>
                <p className="text-sm text-gray-600 italic line-clamp-2 mb-4">
                    {user.bio || 'A wonderful person looking for their partner.'}
                </p>

                <Separator className="bg-gray-200 w-full mb-4"/>
                
                {/* Interests Bar */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-h-16 overflow-hidden">
                    {(user.interests || []).slice(0, 3).map((interest, index) => (
                        <span key={index} className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {interest}
                        </span>
                    ))}
                    {(user.interests || []).length > 3 && (
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                            +{(user.interests.length - 3)} more
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <Link 
                    href={`/viewprofile/${encodeURIComponent(user.username)}`}
                    className="w-full inline-flex items-center justify-center rounded-xl text-md font-bold py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md mt-2"
                >
                    <Heart className="h-5 w-5 mr-2"/> View Full Profile
                </Link>
            </div>
        ));
    };


    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen font-[Inter] space-y-8">
            
            
            <h1 className="text-4xl font-extrabold text-center text-gray-900 flex items-center justify-center pt-4">
                <Search className="mr-3 h-8 w-8 text-blue-600"/> Discover Your **Perfect Match**
            </h1>
            
            <Form {...form}>
                <form className="space-y-8">

                    {/* --- 1. HORIZONTAL FILTER BAR CONTAINER --- */}
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 sticky top-16 z-10">
                        
                        {/* FIX: Added Name/Title above the filter section (Visibility Fix: Text is black) */}
                        <h2 className="text-xl font-extrabold text-black mb-4 flex items-center">
                            <Filter className="h-5 w-5 mr-2 text-blue-600" /> Search & Filter Matches
                        </h2>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            
                            {/* Gender Filter (Horizontal RadioGroup) */}
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    {/* Visibility Fix: Changed text color to black */}
                                    <FormLabel className="text-sm font-bold text-black whitespace-nowrap">Looking For:</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                                            {['Male', 'Female'].map(g => (
                                                <FormItem key={g}>
                                                    <FormControl>
                                                        <RadioGroupItem value={g} id={`gender-${g}`} className="peer sr-only" />
                                                    </FormControl>
                                                    <FormLabel 
                                                        htmlFor={`gender-${g}`} 
                                                        // Visibility Fix: Changed text color to black
                                                        className="px-3 py-1 text-sm font-semibold cursor-pointer rounded-full border border-gray-300 text-black hover:bg-gray-100 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white peer-data-[state=checked]:border-blue-500 transition-all duration-150"
                                                    >
                                                        {g}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}/>

                            <Separator orientation="vertical" className="h-8 hidden lg:block"/>

                            {/* Age Range Filter (Horizontal Inputs) */}
                            <div className="flex items-center gap-2 text-black ">
                                {/* Visibility Fix: Changed text color to black */}
                                <FormLabel className="text-sm font-bold text-black whitespace-nowrap">Age:</FormLabel>
                                <FormField control={form.control} name="ageMin" render={({ field }) => (
                                    <FormItem className="w-20">
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                type="number" 
                                                placeholder="Min" 
                                                min="18" 
                                                // Visibility Fix: Text color is already black inside Input
                                                className="h-8 text-sm border-gray-300 focus:border-blue-500 rounded-md p-1 text-center" 
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                                <span className="text-gray-500">-</span>
                                <FormField control={form.control} name="ageMax" render={({ field }) => (
                                    <FormItem className="w-20">
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                type="number" 
                                                placeholder="Max" 
                                                min="18" 
                                                className="h-8 text-sm border-gray-300 focus:border-blue-500 rounded-md p-1 text-center" 
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                            
                            <Separator orientation="vertical" className="h-8 hidden lg:block"/>

                            {/* Interests (Collapsed Checkboxes) */}
                            <div className="relative flex-grow flex items-center min-w-[200px] max-w-sm">
                                <details className="group w-full">
                                    <summary className="cursor-pointer list-none flex items-center justify-between px-3 py-1.5 text-sm font-bold bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150">
                                        {/* Visibility Fix: Changed text color to black */}
                                        <span className="text-black">Interests ({formValues.interests.length})</span>
                                        <ChevronRight className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-90"/>
                                    </summary>
                                    <div className="absolute right-0 top-full mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-20">
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                            {renderInterestsCheckboxes()}
                                        </div>
                                    </div>
                                </details>
                            </div>
                            
                            {/* Reset Button */}
                            <Button 
                                type="button" 
                                onClick={handleReset} 
                                size="sm"
                                className="h-9 text-sm font-bold flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-all duration-200 shadow-sm"
                            >
                                <RotateCcw className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* --- 2. USER LIST (Grid Layout) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderUserCards()}
                    </div>

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="mt-10 pb-10 flex justify-center items-center space-x-4">
                            <Button onClick={() => handlePageChange(formValues.page - 1)} disabled={formValues.page === 1 || loading} variant="outline" size="icon" className="h-10 w-10">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            {/* Visibility Fix: Changed text color to black */}
                            <span className="text-black font-semibold text-lg">
                                Page <strong>{formValues.page}</strong> of <strong>{totalPages}</strong>
                            </span>

                            <Button onClick={() => handlePageChange(formValues.page + 1)} disabled={formValues.page >= totalPages || loading} variant="outline" size="icon" className="h-10 w-10">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    );
};

export default MatchFinderComponent;