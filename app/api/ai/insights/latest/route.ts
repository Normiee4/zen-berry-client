import { NextRequest } from 'next/server'
import { getLatestInsight } from '@/app/api/ai/insights/latest/controller'

export async function GET(request: NextRequest) {
  return getLatestInsight(request)
}
