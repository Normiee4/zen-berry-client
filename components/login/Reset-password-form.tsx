"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setTimeout(() => setReady(true), 0)
      }
    })
    const hash = window.location.hash
    if (hash && hash.includes("type=recovery")) {
      setTimeout(() => setReady(true), 0)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Password updated successfully!")
    router.push("/auth/login")
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-8 backdrop-blur text-center space-y-4">
        <div className="text-4xl">🔐</div>
        <h2 className="text-xl font-semibold">Invalid or expired reset link</h2>
        <p className="text-sm text-muted-foreground">
          This link may have expired or is invalid. Please request a new one.
        </p>
        <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-sm text-matcha hover:underline">
          <ArrowLeft className="size-4" />
          Request new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card/80 p-8 backdrop-blur">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          New password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-border bg-background/50 pr-10"
            disabled={loading}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-border bg-background/50 pr-10"
            disabled={loading}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-matcha text-cream hover:bg-matcha-light" size="lg" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ArrowRight className="mr-2 size-4" />}
        Reset password
      </Button>

      <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
    </form>
  )
}
