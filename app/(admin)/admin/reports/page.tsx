import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Administration - Signalements' }

interface AdminReport {
  id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  listing: { id: string; title: string } | null
  reporter: { full_name: string | null; phone: string } | null
}

const reasonLabels: Record<string, string> = {
  scam: 'Arnaque',
  inappropriate: 'Contenu inapproprié',
  wrong_category: 'Mauvaise catégorie',
  duplicate: 'Doublon',
  spam: 'Spam',
  other: 'Autre',
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reports')
    .select('id, reason, details, status, created_at, listing:listings(id,title), reporter:users!reporter_id(full_name,phone)')
    .order('created_at', { ascending: false })
    .limit(50)

  const reports = (data || []) as unknown as AdminReport[]

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Signalements</h1>

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="badge badge-error">{reasonLabels[report.reason] || report.reason}</span>
                  <span className={`badge ${report.status === 'pending' ? 'badge-warning' : report.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Annonce:{' '}
                  <a href={`/listings/${report.listing?.id}`} target="_blank" className="text-primary hover:underline">
                    {report.listing?.title || 'Introuvable'}
                  </a>
                </p>
                {report.details && (
                  <p className="text-sm text-gray-600 mt-1">{report.details}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Signalé par {report.reporter?.full_name || 'Inconnu'} · {formatDate(report.created_at)}
                </p>
              </div>
              {report.status === 'pending' && (
                <ResolveReportButton reportId={report.id} />
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun signalement en attente 🎉
          </div>
        )}
      </div>
    </div>
  )
}

async function resolveReportAction(formData: FormData) {
  'use server'
  const reportId = formData.get('reportId') as string
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('reports') as any).update({ status: 'resolved' }).eq('id', reportId)
}

function ResolveReportButton({ reportId }: { reportId: string }) {
  return (
    <form action={resolveReportAction}>
      <input type="hidden" name="reportId" value={reportId} />
      <button type="submit" className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap">
        Résoudre
      </button>
    </form>
  )
}
