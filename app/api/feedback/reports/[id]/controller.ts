import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updateReportStatus, formatReport } from '@/app/api/feedback/reports/service'
import { resolveUser } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase-admin'

const patchSchema = z.object({
  status: z.enum(['pending', 'received', 'resolved']),
})

export async function handlePatchReport(request: Request) {
  try {
    const { userId } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userId !== process.env.OWNER_USER_ID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const reportId = url.pathname.split('/').pop()
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = patchSchema.parse(body)

    const adminSupabase = createAdminClient()
    const report = await updateReportStatus(adminSupabase, reportId, parsed.status)

    return NextResponse.json({ report: formatReport(report) }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message, details: error.issues }, { status: 400 })
    }
    console.error('Report PATCH error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
