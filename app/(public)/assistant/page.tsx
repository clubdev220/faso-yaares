import type { Metadata } from 'next'
import { AssistantChat } from '@/components/assistant/AssistantChat'

export const metadata: Metadata = {
  title: 'Assistant de recherche',
  description: "Décrivez ce que vous cherchez, l'assistant Yaaré trouve les annonces qui correspondent.",
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AssistantPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  return <AssistantChat initialQuery={q?.slice(0, 1000)} />
}
