import { NextRequest } from 'next/server'
import { generateReview } from '@/app/api/ai/review/controller'

export async function POST(request: NextRequest) {
  return generateReview(request)
}