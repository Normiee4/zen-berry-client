"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth-service/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setLoading(false)

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error)
      return
    }

    setSent(true)
    toast.success("Check your email for the reset link!")
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-8 backdrop-blur text-center space-y-4">
        <div className="text-4xl">✉️</div>
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-matcha hover:underline">
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card/80 p-8 backdrop-blur">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Forgot password?</h2>
        <p className="text-sm text-muted-foreground">
          No worries — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-border bg-background/50"
          disabled={loading}
          required
        />
      </div>

      <Button type="submit" className="w-full bg-matcha text-cream hover:bg-matcha-light" size="lg" disabled={loading}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Send reset link
      </Button>

      <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
    </form>
  )
}
