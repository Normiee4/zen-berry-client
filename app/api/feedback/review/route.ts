import { NextRequest } from 'next/server'
import { handleCreateReview } from '@/app/api/feedback/review/controller'

export async function POST(request: NextRequest) {
  return handleCreateReview(request)
}
