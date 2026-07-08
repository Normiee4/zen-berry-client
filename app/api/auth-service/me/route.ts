import { getMe, updateMe, deleteMe } from '@/app/api/auth-service/controller'

export async function GET(request: Request) {
  return getMe(request)
}

export async function PATCH(request: Request) {
  return updateMe(request)
}

export async function DELETE(request: Request) {
  return deleteMe(request)
}
