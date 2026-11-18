"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, Pin, BarChart3, User } from "lucide-react"

const tabs = [
  { href: "/dashboard", label: "Focus", icon: Timer },
  { href: "/dashboard/pins", label: "Pins", icon: Pin },
  { href: "/dashboard/productivity", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
] as const

/** Native-style bottom navigation, shown below the md breakpoint only. */
export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/40 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors active:scale-95 ${
                  isActive ? "text-matcha-dark" : "text-muted-foreground"
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? "bg-matcha/15" : ""}`}>
                  <tab.icon className="size-5" strokeWidth={isActive ? 2 : 1.5} />
                </span>
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
