import "./globals.css";
import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { cookies } from "next/headers"
import { Providers } from "./providers"
import { THEME_CLASS_MAP, THEME_COOKIE_KEY } from "@/lib/theme"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Zen Berry",
  description: "A mindful productivity app with Pomodoro timer, task management, and AI-powered insights",
  applicationName: "Zen Berry",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zen Berry",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#86A788",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get(THEME_COOKIE_KEY)?.value ?? "light-zen"
  const themeClass = THEME_CLASS_MAP[theme] ?? ""

  return (
    <html lang="en" className={themeClass}>
      <body className={nunitoSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
