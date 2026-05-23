import { logout } from '@/app/api/auth-service/controller'

export async function POST(request: Request) {
  return logout(request)
}
