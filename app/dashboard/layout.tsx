"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-matcha text-sm font-bold text-cream">
              ZB
            </div>
            <h1 className="text-lg font-bold text-foreground">Zen Berry</h1>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
