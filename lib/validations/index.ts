import { z } from 'zod'
import { validateBurkinaPhone } from '@/lib/utils'

export const phoneSchema = z
  .string()
  .min(8, 'Numéro de téléphone trop court')
  .refine(validateBurkinaPhone, 'Numéro de téléphone invalide (Burkina Faso)')

export const otpSchema = z
  .string()
  .length(6, 'Le code OTP doit contenir 6 chiffres')
  .regex(/^\d+$/, 'Le code OTP ne doit contenir que des chiffres')

export const loginSchema = z.object({
  phone: phoneSchema,
})

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
})

export const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  city: z.string().min(1, 'Veuillez sélectionner votre ville'),
  neighborhood: z.string().max(100, 'Le quartier est trop long').optional(),
})

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre est trop long'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description est trop longue'),
  price: z
    .number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(999999999, 'Prix trop élevé'),
  category_id: z.string().uuid('Catégorie invalide'),
  city: z.string().min(1, 'Veuillez sélectionner votre ville'),
  neighborhood: z.string().max(100).optional(),
  condition: z.enum(['new', 'good', 'fair'], {
    errorMap: () => ({ message: "État de l'article invalide" }),
  }),
  is_delivery_available: z.boolean().default(false),
})

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  city: z.string().min(1, 'Veuillez sélectionner votre ville'),
  neighborhood: z.string().max(100, 'Le quartier est trop long').optional(),
})

export const reportSchema = z.object({
  listing_id: z.string().uuid(),
  reason: z.enum(['scam', 'inappropriate', 'wrong_category', 'duplicate', 'spam', 'other']),
  details: z.string().max(500).optional(),
})

export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  category_id: z.string().uuid().optional(),
  city: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  condition: z.enum(['new', 'good', 'fair']).optional(),
  sort_by: z
    .enum(['date_desc', 'date_asc', 'price_asc', 'price_desc'])
    .default('date_desc'),
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).max(50).default(12),
})

export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ListingInput = z.infer<typeof listingSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type SearchInput = z.infer<typeof searchSchema>
