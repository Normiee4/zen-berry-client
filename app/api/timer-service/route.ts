import { NextRequest } from 'next/server'
import { getTimerData, createTimerPreset, recordPomodoroCompletion } from '@/app/api/timer-service/controller'

export async function GET(request: NextRequest) {
  return getTimerData(request)
}

export async function POST(request: NextRequest) {
  return createTimerPreset(request)
}

export async function PATCH(request: NextRequest) {
  return recordPomodoroCompletion(request)
}