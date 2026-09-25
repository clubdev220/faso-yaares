'use client'

// Tout est gardé dans le navigateur (localStorage) : accord, historique et
// identifiant d'appareil. Chaque accès est protégé (navigation privée,
// stockage bloqué) : l'assistant reste utilisable en mémoire.

export interface StoredChatItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  // Seuls les ids sont gardés : prix et statut changent, les annonces sont
  // rechargées à la réouverture.
  listingIds?: string[]
}

export interface StoredConversation {
  id: string
  title: string
  updatedAt: number
  items: StoredChatItem[]
}

// Incrémenter la version redemande l'accord (autre fournisseur, autre usage…).
const CONSENT_KEY = 'yaare.assistant.consent.v1'
const CONVERSATIONS_KEY = 'yaare.assistant.conversations'
const DEVICE_ID_KEY = 'yaare.assistant.deviceId'

export const MAX_CONVERSATIONS = 20
export const MAX_ITEMS_PER_CONVERSATION = 40

export function hasAssistantConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted'
  } catch {
    return false
  }
}

export function grantAssistantConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'granted')
  } catch {
    // l'accord sera redemandé à la prochaine visite
  }
}

export function loadConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as StoredConversation[]) : []
  } catch {
    return []
  }
}

export function saveConversations(conversations: StoredConversation[]): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch {
    // persistance au mieux
  }
}

// Identifiant anonyme stable, utilisé seulement pour le quota des visiteurs.
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
    localStorage.setItem(DEVICE_ID_KEY, created)
    return created
  } catch {
    return 'none'
  }
}
