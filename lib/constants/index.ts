export const APP_NAME = 'Yaaré'
export const APP_DESCRIPTION = 'Le marché en ligne du Burkina Faso - Achetez et vendez facilement'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yaarer.com'

export const LISTING_PAGE_SIZE = 12
export const MAX_IMAGES_PER_LISTING = 5
export const MAX_IMAGE_SIZE_MB = 2
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

export const OTP_EXPIRY_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 3
export const SESSION_DURATION_DAYS = 7

export const BURKINA_CITIES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Banfora',
  'Ouahigouya',
  'Pouytenga',
  'Fada N\'Gourma',
  'Dédougou',
  'Kaya',
  'Tenkodogo',
  'Réo',
  'Gaoua',
  'Dori',
  'Manga',
  'Kombissiri',
  'Autre',
] as const

export type BurkinaCity = (typeof BURKINA_CITIES)[number]

// Centre approximatif de chaque ville : coordonnées de repli à la
// publication quand le navigateur ne donne pas sa position.
export const BURKINA_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  Ouagadougou: { latitude: 12.3714, longitude: -1.5197 },
  'Bobo-Dioulasso': { latitude: 11.1771, longitude: -4.2979 },
  Koudougou: { latitude: 12.2529, longitude: -2.3625 },
  Banfora: { latitude: 10.6333, longitude: -4.7667 },
  Ouahigouya: { latitude: 13.5828, longitude: -2.4217 },
  Pouytenga: { latitude: 12.25, longitude: -0.4333 },
  "Fada N'Gourma": { latitude: 12.0617, longitude: 0.3581 },
  Dédougou: { latitude: 12.4633, longitude: -3.4653 },
  Kaya: { latitude: 13.0917, longitude: -1.0847 },
  Tenkodogo: { latitude: 11.7797, longitude: -0.3697 },
  Réo: { latitude: 12.3167, longitude: -2.4667 },
  Gaoua: { latitude: 10.3333, longitude: -3.1833 },
  Dori: { latitude: 14.0333, longitude: -0.0333 },
  Manga: { latitude: 11.6647, longitude: -1.0725 },
  Kombissiri: { latitude: 12.0667, longitude: -1.3333 },
  Autre: { latitude: 12.3714, longitude: -1.5197 },
}

export const NEARBY_RADIUS_KM = 50
export const GEO_COOKIE = 'yaare_geo'

export const REPORT_REASONS = [
  { value: 'scam', label: 'Arnaque / Fraude' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'wrong_category', label: 'Mauvaise catégorie' },
  { value: 'duplicate', label: 'Annonce en double' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Autre raison' },
] as const

export const LISTING_CONDITIONS = [
  { value: 'new', label: 'Neuf', description: 'Jamais utilisé, dans son emballage d\'origine' },
  { value: 'good', label: 'Bon état', description: 'Utilisé mais en très bon état, peu de traces d\'usure' },
  { value: 'fair', label: 'État correct', description: 'Utilisé, quelques traces d\'usure visibles' },
] as const

export const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus récentes' },
  { value: 'date_asc', label: 'Plus anciennes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'nearest', label: 'Plus proche' },
] as const

export const WHATSAPP_BASE_URL = 'https://wa.me'
export const COUNTRY_CODE = '+226'

export const CATEGORIES_DATA = [
  { name: 'Véhicules', slug: 'vehicules', icon: '🚗', color: '#3B82F6', display_order: 1 },
  { name: 'Immobilier', slug: 'immobilier', icon: '🏠', color: '#10B981', display_order: 2 },
  { name: 'Téléphones', slug: 'telephones', icon: '📱', color: '#8B5CF6', display_order: 3 },
  { name: 'Électronique', slug: 'electronique', icon: '💻', color: '#F59E0B', display_order: 4 },
  { name: 'Mode & Vêtements', slug: 'mode', icon: '👗', color: '#EC4899', display_order: 5 },
  { name: 'Maison & Jardin', slug: 'maison', icon: '🛋️', color: '#14B8A6', display_order: 6 },
  { name: 'Produits locaux', slug: 'produits-locaux', icon: '🌾', color: '#84CC16', display_order: 7 },
  { name: 'Sports & Loisirs', slug: 'sports', icon: '⚽', color: '#F97316', display_order: 8 },
  { name: 'Emplois', slug: 'emplois', icon: '💼', color: '#6366F1', display_order: 9 },
  { name: 'Autres', slug: 'autres', icon: '📦', color: '#6B7280', display_order: 10 },
] as const
