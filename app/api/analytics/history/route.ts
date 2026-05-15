import { NextRequest } from 'next/server'
import { getAnalyticsHistory } from '@/app/api/analytics/history/controller'

export async function GET(request: NextRequest) {
  return getAnalyticsHistory(request)
}