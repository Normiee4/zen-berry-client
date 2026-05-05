import { NextRequest } from 'next/server'
import { getTimerData, createTimerPreset, recordPomodoroCompletion } from '@/app/api/timer-service/controller'

export async function GET(request: NextRequest) {
  // request is param name, and NextRequest is the type since 
  // I am using typescript here.
  return getTimerData(request)
}

export async function POST(request: NextRequest) {
  return createTimerPreset(request)
}

export async function PATCH(request: NextRequest) {
  return recordPomodoroCompletion(request)
}