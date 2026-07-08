"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-react'

interface Report {
  id: string
  issue: string
  explanation: string
  suggestions: string
  bugDetail: string | null
  status: 'pending' | 'received' | 'resolved'
  createdAt: string
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

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  received: 'bg-matcha/10 text-matcha',
  resolved: 'bg-gray-100 text-gray-500',
}

export default function ReportLogsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/feedback/reports')
        if (res.status === 401) {
          router.push('/auth/login')
          return
        }
        if (res.status === 404) {
          router.push('/')
          return
        }
        if (!res.ok) {
          setError('Failed to load reports')
          return
        }
        const data = await res.json()
        setReports(data.reports ?? [])
      } catch {
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [router])

  const updateStatus = async (id: string, status: 'pending' | 'received' | 'resolved') => {
    const res = await fetch(`/api/feedback/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-matcha" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-strawberry-light/50 bg-card/60 backdrop-blur-sm">
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

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">All Reports</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-3xl border border-strawberry-light/50 bg-strawberry-light/30 p-12 text-center">
            <p className="text-lg text-muted-foreground">No reports yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-strawberry-light/50 bg-card/80 backdrop-blur-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-strawberry-light/50 bg-strawberry-light/30">
                  <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Issue</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Explanation</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Suggestions</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Bug Details</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-strawberry-light/30 transition-colors last:border-b-0 hover:bg-strawberry-light/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{report.issue}</td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.explanation}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.suggestions}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {report.bugDetail || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative group">
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusStyles[report.status]}`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          <ChevronDown className="size-3" />
                        </button>
                        <div className="absolute right-0 top-full z-10 mt-1 hidden min-w-[130px] rounded-xl border border-strawberry-light/50 bg-card shadow-lg group-hover:block">
                          {['pending', 'received', 'resolved'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateStatus(report.id, s as Report['status'])}
                              className={`block w-full px-4 py-2 text-left text-xs font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-strawberry-light/30 ${
                                report.status === s ? 'text-matcha' : 'text-muted-foreground'
                              }`}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
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
