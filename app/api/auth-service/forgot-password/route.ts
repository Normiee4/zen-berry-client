import { forgotPassword } from '@/app/api/auth-service/controller'

export async function POST(request: Request) {
  return forgotPassword(request)
}
