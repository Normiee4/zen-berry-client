import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as reportService from '@/app/api/feedback/report/service'
import { resolveUser } from '@/lib/auth-helpers'

const createReportSchema = z.object({
  issue: z.string().min(1, 'Issue is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  suggestions: z.string().min(1, 'Suggestions is required'),
  bug_detail: z.string().optional(),
})

export async function handleCreateReport(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createReportSchema.parse(body)

    const report = await reportService.insertReport(supabase, userId, {
      issue: parsed.issue,
      explanation: parsed.explanation,
      suggestions: parsed.suggestions,
      bug_detail: parsed.bug_detail,
    })

    if (report.error) {
      return NextResponse.json({ error: report.error.message }, { status: 400 })
    }

    return NextResponse.json(reportService.formatReport(report.data), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message, details: error.issues }, { status: 400 })
    }
    console.error('Report POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
