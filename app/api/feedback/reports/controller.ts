import { NextResponse } from 'next/server'
import * as reportsService from '@/app/api/feedback/reports/service'
import { resolveUser } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase-admin'

export async function handleGetReports(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerUserId = process.env.OWNER_USER_ID

    if (userId === ownerUserId) {
      const adminSupabase = createAdminClient()
      const reports = await reportsService.fetchAllReports(adminSupabase)
      return NextResponse.json({ reports: reports.map(reportsService.formatReport) }, { status: 200 })
    }

    const reports = await reportsService.fetchUserReports(supabase, userId)
    return NextResponse.json({ reports: reports.map(reportsService.formatReport) }, { status: 200 })
  } catch (error) {
    console.error('Reports GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
