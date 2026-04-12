import { BackgroundBlobs } from "@/components/ui/Background-blobs"
import { BrandHeader } from "@/components/ui/Brand-header"
import { SignupForm } from "@/components/sign-up/Signup-form"
import { LoginLink } from "@/components/sign-up/Login-link"

export const metadata = {
  title: "Sign Up — Zen Berry",
  description: "Create your Zen Berry account and start focusing sweetly",
}

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/20 to-matcha-light/10">
      <BackgroundBlobs />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <BrandHeader />
          <SignupForm />
          <LoginLink />
        </div>
      </div>
    </div>
  )
}