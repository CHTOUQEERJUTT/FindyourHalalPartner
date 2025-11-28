'use client';

import { Button } from '@/app/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { messageSchema } from '@/src/schemas/messageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/app/components/ui/form';
import { toast } from 'sonner';

export default function SendMessageClient() {
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
      const response = await axios.post(`/api/sendMessage?recipient=${recipient}`, data);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
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
                  <Input placeholder="Write your message..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full font-semibold">
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
