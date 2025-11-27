import * as z from 'zod'

export const profilePageSchema = z.object({
  bio: z.string().max(300, "Bio must be under 300 characters"),
  age: z.number().min(18, "Age must be 18 or above"),
  gender: z.string().min(1, "Gender is required"),
  interests: z.array(z.string()).optional(),
  socialLinks: z.array(z.string().url("Invalid URL")).optional(),
});