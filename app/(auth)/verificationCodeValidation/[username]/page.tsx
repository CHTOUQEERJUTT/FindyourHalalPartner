'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast, Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'

import { verificationCodeSchema } from '@/src/schemas/verificationCodeSchema'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/app/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'

export default function VerificationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [errors, setErrors] = useState('')
  const router = useRouter()
  const params = useParams()
  const username = params.username as string

  const form = useForm<z.infer<typeof verificationCodeSchema>>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      verificationCode: '',
    },
  })

  // countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // submit verification code
  async function onSubmit(data: z.infer<typeof verificationCodeSchema>) {
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/verificationCodeValidation', {
        username,
        verificationCode: data.verificationCode,
      })

      if (response.data.success) {
        toast.success('User verification successful!')
        router.replace(`/dashboard`)
      } else {
        toast.error(response.data.message || 'Verification failed')
        setErrors(response.data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error('Something went wrong, please try again')
      setErrors('Something went wrong, please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  // resend code handler
  async function handleResend() {
    if (resendTimer > 0) return
    try {
      setResendTimer(30)
      await axios.post('/api/resendVerificationCode', { username })
      toast.success('A new verification code has been sent to your email.')
    } catch (error) {
      toast.error('Failed to resend verification code.')
    }
  }

  return (
    // Background: Soft Gray
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800 p-4">
      <Toaster richColors theme="light" />
      {/* Card: Crisp White, elegant shadow, rounded */}
      <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-2xl border border-gray-200 space-y-7">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Verify Your Account
        </h2>
        <p className="text-md text-center text-gray-500 mb-8">
          A 6-digit code has been sent to the email associated with <span className="font-semibold text-gray-700">{username}</span>.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium sr-only">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center mt-3">
                      {/* Using the simple, stable InputOTP structure */}
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        {...field}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot 
                            index={0} 
                            // OTP slot style: White background, gray border, mint focus ring
                            className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]"
                          />
                          <InputOTPSlot index={1} className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]" />
                          <InputOTPSlot index={2} className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]" />
                          <InputOTPSlot index={3} className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]" />
                          <InputOTPSlot index={4} className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]" />
                          <InputOTPSlot index={5} className="size-12 text-lg rounded-lg border border-gray-300 bg-white text-gray-900 transition-all focus:border-[#55efc4] focus:ring-2 focus:ring-[#55efc4]" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors && (
              <p className="text-red-600 text-sm text-center">{errors}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              // Primary Button Style: Mint green background, black text
              className="w-full font-semibold bg-[#55efc4] text-black rounded-lg py-2.5 hover:bg-[#48d9b0] shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            {/* Resend Code */}
            <p className="text-sm text-center text-gray-600 mt-6">
              Didn’t receive the code?{' '}
              <span
                onClick={handleResend}
                className={`font-semibold cursor-pointer transition ${
                  resendTimer > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#55efc4] hover:underline'
                }`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
              </span>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}
