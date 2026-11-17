import type { Metadata } from "next"
import { BackgroundBlobs } from "@/components/ui/Background-blobs"
import { BrandHeader } from "@/components/ui/Brand-header"
import { ResetPasswordForm } from "@/components/login/Reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Zen Berry account.",
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/20 to-matcha-light/10">
      <BackgroundBlobs />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <BrandHeader />
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  )
}
