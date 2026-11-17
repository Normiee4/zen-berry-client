import { Metadata } from 'next'
import { BackgroundBlobs } from "@/components/ui/Background-blobs"
import { BrandHeader } from "@/components/ui/Brand-header"
import { LoginForm } from '@/components/login/Login-form' 
import { SignUpLink } from '@/components/login/Signup-link'

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Zen Berry productivity account.",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/20 to-matcha-light/10">
      <BackgroundBlobs />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <BrandHeader />
          <LoginForm />
          <SignUpLink />
        </div>
      </main>
    </div>
  )
}