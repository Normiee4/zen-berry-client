"use client"

import { usePathname, useRouter } from "next/navigation"
import { Timer, Pin, BarChart3, User, LogOut } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  onLogout?: () => void
}

const navItems = [
  { href: "/dashboard", label: "Focus", icon: Timer },
  { href: "/dashboard/pins", label: "Pins", icon: Pin },
  { href: "/dashboard/productivity", label: "Productivity", icon: BarChart3 },
] as const

const bottomItems = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
] as const

export function Sidebar({ isOpen, onClose, userName, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigate = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border/30 bg-card shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User section */}
        <div className="flex flex-col items-center gap-2 border-b border-border/30 px-6 py-8">
          <img
            src="/strawberry_illustration.png"
            alt="Strawberry"
            className="h-16 w-16 object-contain"
          />
          <p className="text-sm font-semibold text-matcha">
            {new Date().getHours() < 12
              ? "Good Morning!"
              : new Date().getHours() < 18
                ? "Good Afternoon!"
                : "Good Evening!"}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {userName ?? "User"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-matcha/10 text-matcha"
                    : "text-muted-foreground hover:bg-strawberry/10 hover:text-foreground"
                }`}
              >
                <item.icon className="size-5" strokeWidth={1.5} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom items */}
        <nav className="flex flex-col gap-1 px-3 py-2">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-matcha/10 text-matcha"
                    : "text-muted-foreground hover:bg-strawberry/10 hover:text-foreground"
                }`}
              >
                <item.icon className="size-5" strokeWidth={1.5} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="border-t border-border/30 px-3 py-3">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="size-5" strokeWidth={1.5} />
              Log out
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
