'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios, { AxiosError } from 'axios'
import { toast, Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { signUpSchema } from '@/src/schemas/signUpSchema'
import { apiResponse } from '@/src/types/apiResponse'

import { Button } from '@/components/ui/button'

import { Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
 } from '@/app/components/ui/form'


import { Input } from '@/components/ui/input'

// Simple SVG Icons for OAuth buttons (White background compatible)
const GoogleIcon = () => (
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
)

const GitHubIcon = () => (
  <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="h-5 w-5" />
)

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string | undefined>('')

  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/signup', data)
      toast.success(response?.data?.message)
      router.replace(`/verificationCodeValidation/${data.username}`)
    } catch (error) {
      const axiosError = error as AxiosError<apiResponse>
      let errorMessage = axiosError?.response?.data?.message
      toast.error(errorMessage || 'Signup failed')
      setErrors(String(errorMessage || 'Signup failed'))
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Halal Partner
          </h1>
          <p className="text-md text-gray-500">
            Create your account to start your journey.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Ayesha_24"
                      {...field}
                      // Input style: Light background, mint focus ring
                      className="bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      className="bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#55efc4] focus:border-[#55efc4] placeholder:text-gray-400 text-gray-800 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors && <p className="text-red-600 text-sm">{errors}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              // Primary Button Style: Mint green background, black text
              className="w-full font-semibold bg-[#55efc4] text-black rounded-lg py-2.5 hover:bg-[#48d9b0] shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Sign Up'
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
          Already have an account?{' '}
          <a
            href="/signin"
            // Mint link color
            className="text-[#55efc4] font-semibold hover:underline transition-colors"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  )
}