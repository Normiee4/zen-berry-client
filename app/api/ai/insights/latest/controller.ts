import { NextResponse } from 'next/server'
import * as insightsService from '@/app/api/ai/insights/latest/service'
import { getUserIdFromRequest } from '@/lib/auth-helpers'

export async function getLatestInsight(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = insightsService.createSupabaseClient(request)
    const insight = await insightsService.fetchLatestInsight(supabase, userId)

    if (!insight) {
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json(
      {
        insight: insight.insight_message,
        suggestion: insight.recommendation,
        milestone: insight.milestone,
        stats: {
          productivityLevel: insight.productivity_level,
          consistencyRate: insight.consistency_rate,
          cyclesTotal: insight.cycles_total,
          peakHours: insight.peak_hours,
          peakDays: insight.peak_days,
        },
        createdAt: insight.created_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Latest insight error:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : '')
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
