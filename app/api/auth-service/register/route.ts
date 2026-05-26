import { register } from '@/app/api/auth-service/controller'

export async function POST(request: Request) {
  return register(request)
}
