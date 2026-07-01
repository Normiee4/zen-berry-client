import { NextRequest } from 'next/server'
import { handleGetReports } from '@/app/api/feedback/reports/controller'

export async function GET(request: NextRequest) {
  return handleGetReports(request)
}
