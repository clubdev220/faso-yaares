import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { normalizePhone, validateBurkinaPhone } from '@/lib/utils'

const schema = z.object({
  phone: z.string().min(8),
})

type SupabaseAuthError = {
  code?: string
  message?: string
  status?: number
}

function getAuthErrorDetails(error: unknown): SupabaseAuthError {
  if (!error || typeof error !== 'object') return {}

  const authError = error as SupabaseAuthError

  return {
    code: authError.code,
    message: authError.message,
    status: authError.status,
  }
}

function maskPhone(phone: string): string {
  return phone.replace(/(\+\d{3})\d+(\d{2})$/, '$1******$2')
}

function getOtpErrorResponse(error: unknown) {
  const { code, message, status } = getAuthErrorDetails(error)
  const isRateLimited =
    status === 429 || code === 'over_sms_send_rate_limit' || code === 'over_request_rate_limit'

  let publicMessage = 'Erreur lors de l\'envoi du SMS. Vérifiez votre numéro.'

  if (code === 'sms_send_failed') {
    publicMessage = 'Envoi SMS impossible. Vérifiez la configuration SMS dans Supabase.'
  } else if (code === 'phone_provider_disabled' || code === 'provider_disabled' || code === 'otp_disabled') {
    publicMessage = 'La connexion par téléphone n\'est pas activée dans Supabase.'
  } else if (code === 'validation_failed') {
    publicMessage = 'Numéro de téléphone invalide. Vérifiez le format international.'
  } else if (isRateLimited) {
    publicMessage = 'Trop de demandes SMS. Réessayez dans quelques minutes.'
  }

  return {
    status: isRateLimited ? 429 : status && status >= 400 && status < 500 ? status : 400,
    body: {
      error: publicMessage,
      ...(code ? { code } : {}),
      ...(process.env.NODE_ENV !== 'production' && message ? { details: message } : {}),
    },
  }
}

// Simple in-memory rate limiting (replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(phone: string): boolean {
  const now = Date.now()
  const key = phone
  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 }) // 10 min window
    return true
  }

  if (entry.count >= 3) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone: rawPhone } = schema.parse(body)

    const phone = normalizePhone(rawPhone)

    if (!validateBurkinaPhone(phone.replace('+', ''))) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (!checkRateLimit(phone)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 10 minutes.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    })

    if (error) {
      const response = getOtpErrorResponse(error)
      console.error('OTP error:', {
        phone: maskPhone(phone),
        code: response.body.code,
        status: response.status,
        details: response.body.details,
      })

      return NextResponse.json(response.body, { status: response.status })
    }

    return NextResponse.json({ success: true, message: 'Code envoyé par SMS' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    console.error('OTP request error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
