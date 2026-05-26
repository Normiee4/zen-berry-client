import "./globals.css";
import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { Providers } from "./providers"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Zen Berry",
  description: "A mindful productivity app with Pomodoro timer, task management, and AI-powered insights",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#86A788",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunitoSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}