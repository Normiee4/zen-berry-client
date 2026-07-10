"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Trash2, AlertTriangle, Loader2, Sun, Moon, Sunset, Check } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { THEME_CLASS_MAP, THEME_COOKIE_KEY, THEME_LOCAL_STORAGE_KEY } from "@/lib/theme"

interface UserData {
  id: string
  email: string
  name: string
  theme_preference?: string
}

const themes = [
  {
    id: "light-zen",
    name: "Light Zen",
    icon: Sun,
    description: "Bright, airy, morning tea",
    swatches: ["#FFFDEC", "#86A788", "#FFCFCF", "#5C7D5E"],
  },
  {
    id: "warm-earth",
    name: "Warm Earthy",
    icon: Sunset,
    description: "Cozy sunset, grounded",
    swatches: ["#F5F0E8", "#86A788", "#FFCFCF", "#8C8678"],
  },
  {
    id: "cozy-dark",
    name: "Cozy Dark",
    icon: Moon,
    description: "Warm evening, candlelit",
    swatches: ["#1E1B16", "#A8D5A2", "#FFB5B5", "#EDE9E0"],
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingTheme, setSavingTheme] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        else router.push("/auth/login")
      })
      .catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false))
  }, [router])

  const currentTheme = user?.theme_preference ?? "light-zen"

  const handleThemeChange = async (themeId: string) => {
    if (themeId === currentTheme) return
    setSavingTheme(themeId)

    const cls = THEME_CLASS_MAP[themeId] ?? ''
    document.documentElement.className = cls
    document.cookie = `${THEME_COOKIE_KEY}=${themeId}; path=/; max-age=31536000`
    localStorage.setItem(THEME_LOCAL_STORAGE_KEY, themeId)

    try {
      const res = await fetch("/api/auth-service/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_preference: themeId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save theme")
        const revertCls = THEME_CLASS_MAP[currentTheme] ?? ''
        document.documentElement.className = revertCls
        return
      }
      setUser((prev) => prev ? { ...prev, theme_preference: themeId } : prev)
      toast.success(`Theme changed to ${themes.find((t) => t.id === themeId)?.name}`)
    } catch {
      const revertCls = THEME_CLASS_MAP[currentTheme] ?? ''
      document.documentElement.className = revertCls
      toast.error("Something went wrong")
    } finally {
      setSavingTheme(null)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/auth-service/me", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete account")
        return
      }
      toast.success("Account deleted successfully")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-matcha" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-matcha/10">
          <User className="size-6 text-matcha" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border/30 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Account Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-foreground">{user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-foreground">{user?.email ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border/30 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Theme</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose your preferred ambiance. Brand accents stay consistent across all themes.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themes.map((theme) => {
            const Icon = theme.icon
            const isActive = currentTheme === theme.id
            const isSaving = savingTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                disabled={isSaving}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  isActive
                    ? "border-matcha bg-matcha/5"
                    : "border-border/30 bg-white hover:border-matcha/50"
                }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-matcha">
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </div>
                )}
                {isSaving && (
                  <div className="absolute right-2 top-2">
                    <Loader2 className="size-4 animate-spin text-matcha" />
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-matcha" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-foreground">{theme.name}</span>
                </div>
                <div className="mb-2 flex gap-1">
                  {theme.swatches.map((color) => (
                    <div
                      key={color}
                      className="size-5 rounded-full border border-border/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="mb-4 text-sm text-red-500">
          Once you delete your account, all your data will be permanently removed. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
          Delete Account
        </button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="size-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-foreground">Delete Account</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete your account and all associated data, including tasks, pins,
              timer sessions, and insights. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-3 sm:justify-center">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-xl border border-border/30 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" strokeWidth={1.5} />
              )}
              {deleting ? "Deleting..." : "Yes, delete my account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
