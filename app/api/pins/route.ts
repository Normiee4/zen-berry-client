import { NextRequest } from 'next/server'
import { getPins, createPin, updatePin, deletePin } from '@/app/api/pins/controller'

export async function GET(request: NextRequest) {
  return getPins(request)
}

export async function POST(request: NextRequest) {
  return createPin(request)
}

export async function PATCH(request: NextRequest) {
  return updatePin(request)
}

export async function DELETE(request: NextRequest) {
  return deletePin(request)
}
