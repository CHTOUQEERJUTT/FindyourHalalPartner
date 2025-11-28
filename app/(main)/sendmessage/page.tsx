'use client';

export const dynamic = "force-dynamic"; // ⭐ FIXES VERCEL ERROR

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { messageSchema } from '@/src/schemas/messageSchema';

import { Form } from '@/app/components/ui/form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';

import { Input } from '@/app/components/ui/input';
import { Button } from '@/components/ui/button';

function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const recipient = searchParams.get('recipient');

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const res = await axios.post(
        `/api/sendMessage?recipient=${recipient}`,
        data
      );
      toast.success(res.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Send message to <span className="text-[#55efc4]">{recipient}</span>
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Write your message..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Page;
