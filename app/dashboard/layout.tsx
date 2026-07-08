"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle"
import { MessageSquareText, MessageSquareWarning } from "lucide-react"
import { ReviewModal } from "@/components/feedback/review-modal"

interface UserData {
  name: string
  theme_preference?: string
}

const THEME_CLASS_MAP: Record<string, string> = {
  'light-zen': '',
  'warm-earth': 'warm-earth',
  'cozy-dark': 'cozy-dark',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          const theme = data.user.theme_preference ?? 'light-zen'
          const cls = THEME_CLASS_MAP[theme] ?? ''
          document.documentElement.className = cls
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth-service/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/30 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            <img
              src="/Zen-berry Logo.png"
              alt="Zen Berry"
              className="h-9 w-9 object-contain"
            />
            <h1 className="text-lg font-bold text-foreground">Zen Berry</h1>
            <div className="ml-auto flex items-center gap-1">
              <Link
                href="/feedback?tab=review"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha"
              >
                <MessageSquareText className="size-4" strokeWidth={1.5} />
                Review
              </Link>
              <Link
                href="/feedback?tab=report"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha"
              >
                <MessageSquareWarning className="size-4" strokeWidth={1.5} />
                Report
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <ReviewModal />
    </div>
  )
}
