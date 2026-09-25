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

// Les dates s'affichent à l'heure du Burkina, pas celle de l'appareil.
export const APP_TIME_ZONE = 'Africa/Ouagadougou'

export function formatMonthYear(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-BF', {
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIME_ZONE,
  })
}

// Clé « AAAA-MM-JJ » dans le fuseau du Burkina : sert à comparer des jours
// indépendamment du fuseau de l'appareil.
export function getMessageDayKey(date: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function zonedYear(d: Date): number {
  return Number(getMessageDayKey(d).slice(0, 4))
}

export function formatMessageTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('fr-BF', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: APP_TIME_ZONE,
  })
}

// Sous chaque bulle : l'heure aujourd'hui, « Hier à HH:MM », sinon la date.
export function formatMessageTimestamp(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const day = getMessageDayKey(d)

  if (day === getMessageDayKey(now)) return formatMessageTime(d)
  if (day === getMessageDayKey(yesterday)) return `Hier à ${formatMessageTime(d)}`

  return `${d.toLocaleDateString('fr-BF', {
    day: 'numeric',
    month: 'short',
    year: zonedYear(d) !== zonedYear(now) ? 'numeric' : undefined,
    timeZone: APP_TIME_ZONE,
  })} à ${formatMessageTime(d)}`
}

// Séparateur de jour dans une conversation.
export function formatMessageDateDivider(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const day = getMessageDayKey(d)

  if (day === getMessageDayKey(now)) return "Aujourd'hui"
  if (day === getMessageDayKey(yesterday)) return 'Hier'

  return d.toLocaleDateString('fr-BF', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: zonedYear(d) !== zonedYear(now) ? 'numeric' : undefined,
    timeZone: APP_TIME_ZONE,
  })
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round((km * 1000) / 100) * 100)} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yaarer.com'
  const url = `${baseUrl}/listings/${listing.id}`
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
