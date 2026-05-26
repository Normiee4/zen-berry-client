import { BackgroundBlobs } from "@/components/ui/Background-blobs"
import { BrandHeader } from "@/components/ui/Brand-header"
import { ForgotPasswordForm } from "@/components/login/Forgot-password-form"

export const metadata = {
  title: "Forgot Password — Zen Berry",
  description: "Reset your Zen Berry password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/20 to-matcha-light/10">
      <BackgroundBlobs />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BrandHeader />
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
