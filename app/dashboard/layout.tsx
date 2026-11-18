"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle"
import { MobileTabBar } from "@/components/sidebar/mobile-tab-bar"
import { MessageSquareText, MessageSquareWarning } from "lucide-react"
import { ReviewModal } from "@/components/feedback/review-modal"
import { TourHelpButton } from "@/components/product-tour/tour-help-button"
import { useProductTourStore } from "@/store/product-tour-store"
import { THEME_CLASS_MAP, THEME_COOKIE_KEY, THEME_LOCAL_STORAGE_KEY } from "@/lib/theme"

interface UserData {
  name: string
  theme_preference?: string
}

function setThemePrefs(theme: string) {
  const cls = THEME_CLASS_MAP[theme] ?? ""
  document.documentElement.className = cls
  document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000`
  localStorage.setItem(THEME_LOCAL_STORAGE_KEY, theme)
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
          setThemePrefs(theme)
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
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/30 bg-card/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            <img
              src="/zen-berry-logo.png"
              alt="Zen Berry"
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
            <span className="truncate text-base font-bold text-foreground sm:text-lg">Zen Berry</span>
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <Link
                href="/feedback?tab=review"
                aria-label="Review"
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha sm:px-3"
              >
                <MessageSquareText className="size-5 sm:size-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Review</span>
              </Link>
              <Link
                href="/feedback?tab=report"
                aria-label="Report"
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha sm:px-3"
              >
                <MessageSquareWarning className="size-5 sm:size-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Report</span>
              </Link>
              <TourHelpButton onClick={() => useProductTourStore.getState().triggerTour()} />
            </div>
          </div>
        </header>

        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      </div>

      <MobileTabBar />
      <ReviewModal />
    </div>
  )
}
