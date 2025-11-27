import * as z from 'zod'

export const verificationCodeSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits"),
});