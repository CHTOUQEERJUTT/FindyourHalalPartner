'use client'

import { Button } from '@/app/components/ui/button'

import { Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage

 } from '@/app/components/ui/form'

import { Input } from '@/app/components/ui/input'
import { signInSchema } from '@/src/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'sonner' 
import * as z from 'zod'

// Simple SVG Icons for OAuth buttons (White background compatible)
const GoogleIcon = () => (
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
)

const GitHubIcon = () => (
  <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="h-5 w-5" />
)

export default function SignInPage() { 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await signIn('credentials', {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      })

      if (response?.error) {
        toast.error(response.error)
      }

      if (response?.url) {
        router.replace('/dashboard')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // Background: Soft Gray
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800 p-4">
      <Toaster richColors theme="light" />
      {/* Card: Crisp White, elegant shadow, rounded */}
      <div className="w-full max-w-md space-y-7 bg-white p-10 rounded-xl shadow-2xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-md text-gray-500">
            Sign in to continue your journey.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Email or Username
                  </FormLabel>
                  <Input
                    {...field}
                    // Input style: Light background, mint focus ring
                    className="bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    {...field}
                    className="bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* You might want a 'Forgot Password' link here */}

            <Button
              type="submit"
              // Primary Button Style: Mint green background, black text
              className="w-full font-semibold bg-[#55efc4] text-black rounded-lg py-2.5 hover:bg-[#48d9b0] shadow-md transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>

        {/* Separator */}
        <div className="flex items-center justify-center my-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="mx-3 text-gray-500 text-sm">OR</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            // OAuth button style: White background, gray border, black text
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <GoogleIcon />
            <span className="font-medium">Continue with Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            <GitHubIcon />
            <span className="font-medium">Continue with GitHub</span>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{' '}
          <a
            href="/signup"
            // Mint link color
            className="text-[#55efc4] font-semibold hover:underline transition-colors"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}