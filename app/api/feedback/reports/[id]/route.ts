import { NextRequest } from 'next/server'
import { handlePatchReport } from '@/app/api/feedback/reports/[id]/controller'

export async function PATCH(request: NextRequest) {
  return handlePatchReport(request)
}
