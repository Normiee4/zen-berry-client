import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { ArrowLeft } from 'lucide-react'
import { fetchAllReports } from '@/app/api/feedback/reports/service'

export const metadata: Metadata = {
  title: 'Report Logs | Zen Berry',
  description: 'View submitted reports and feedback.',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ReportLogsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const ownerUserId = process.env.OWNER_USER_ID
  if (user.id !== ownerUserId) {
    notFound()
  }

  const adminSupabase = createAdminClient()
  const reportRows = await fetchAllReports(adminSupabase)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-strawberry-light/50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-matcha"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Report Logs</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">All Reports</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reportRows.length} report{reportRows.length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {reportRows.length === 0 ? (
          <div className="rounded-3xl border border-strawberry-light/50 bg-strawberry-light/30 p-12 text-center">
            <p className="text-lg text-muted-foreground">No reports yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-strawberry-light/50 bg-white/80 backdrop-blur-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-strawberry-light/50 bg-strawberry-light/30">
                  <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Issue</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Explanation</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Suggestions</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Bug Details</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-strawberry-light/30 transition-colors last:border-b-0 hover:bg-strawberry-light/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{report.issue}</td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.explanation}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.suggestions}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.bug_detail || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
