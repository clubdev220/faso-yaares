import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-BF', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`

  return d.toLocaleDateString('fr-BF', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('226')) {
    const local = cleaned.slice(3)
    return `+226 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6)}`
  }
  return phone
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

export function buildWhatsAppMessage(listing: {
  title: string
  price: number
  id: string
}): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listing.id}`
  return `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" à ${formatPrice(listing.price)} sur Yaaré.\n${url}`
}

export function getImagePlaceholder(): string {
  return '/icons/image-placeholder.svg'
}

export function validateBurkinaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  // Burkina phone: starts with 226 (country code) + 8 digits
  // Or just 8 digits starting with 2x, 5x, 6x, 7x
  if (cleaned.startsWith('226')) {
    return /^226[2-7]\d{7}$/.test(cleaned)
  }
  return /^[2-7]\d{7}$/.test(cleaned)
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('226')) return `+${cleaned}`
  return `+226${cleaned}`
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return value
}

export function getListingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Actif',
    sold: 'Vendu',
    expired: 'Expiré',
    deleted: 'Supprimé',
    pending: 'En attente',
  }
  return labels[status] || status
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    new: 'Neuf',
    good: 'Bon état',
    fair: 'État correct',
  }
  return labels[condition] || condition
}
