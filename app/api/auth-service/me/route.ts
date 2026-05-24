import { getMe } from '@/app/api/auth-service/controller'

export async function GET(request: Request) {
  return getMe(request)
}
