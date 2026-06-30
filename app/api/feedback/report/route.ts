import { NextRequest } from 'next/server'
import { handleCreateReport } from '@/app/api/feedback/report/controller'

export async function POST(request: NextRequest) {
  return handleCreateReport(request)
}
