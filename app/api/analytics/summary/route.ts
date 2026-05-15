import { NextRequest } from 'next/server'
import { getAnalyticsSummary } from '@/app/api/analytics/summary/controller'

export async function GET(request: NextRequest) {
  return getAnalyticsSummary(request)
}