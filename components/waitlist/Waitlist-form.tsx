"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { useState } from "react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement waitlist submission logic
    console.log({ email, name })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white/80 p-8 backdrop-blur">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-border bg-cream/50 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name (optional)
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border bg-cream/50"
        />
      </div>

      <Button type="submit" className="w-full bg-matcha text-cream hover:bg-matcha-light" size="lg">
        Join the waitlist
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll send you early access as soon as we launch.
      </p>
    </form>
  )
}