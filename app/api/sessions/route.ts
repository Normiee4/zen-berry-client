import { NextRequest } from 'next/server'
import { recordSession, getTodayStats } from '@/app/api/sessions/controller'

export async function GET(request: NextRequest) {
  return getTodayStats(request)
}

export async function POST(request: NextRequest) {
  return recordSession(request)
}