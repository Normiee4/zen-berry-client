"use client"

import { useSyncExternalStore, type ReactNode } from "react"

export function DnDWrapper({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}
