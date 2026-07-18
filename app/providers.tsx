"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"
import { SWRegister } from "@/components/pwa/sw-register"
import { SWUpdateToast } from "@/components/pwa/sw-update-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <SWRegister />
      <SWUpdateToast />
    </QueryClientProvider>
  )
}
