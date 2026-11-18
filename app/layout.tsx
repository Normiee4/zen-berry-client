import "./globals.css";
import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { cookies } from "next/headers"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Providers } from "./providers"
import { InstallPrompt } from "@/components/InstallPrompt"
import { CookieConsentBanner } from "@/components/cookies/cookie-consent-banner"
import { THEME_CLASS_MAP, THEME_COOKIE_KEY } from "@/lib/theme"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zen-berry.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  title: {
    default: "Zen Berry — Mindful Pomodoro Timer & Productivity App",
    template: "%s | Zen Berry",
  },
  description:
    "Focus sweetly and grow daily with Zen Berry — a mindful Pomodoro timer, soft task manager, and gentle productivity tracker designed to prevent burnout.",
  applicationName: "Zen Berry",
  verification: {
    google: "gfyhFa7XCaZH52TVpwmyOtc0x_9OMFmB6pL5eBpz2I4",
  },
  keywords: [
    "Zen Berry",
    "pomodoro timer",
    "mindful productivity",
    "focus app",
    "task management",
    "burnout-free productivity",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Zen Berry",
    title: "Zen Berry — Mindful Pomodoro Timer & Productivity App",
    description:
      "Focus sweetly and grow daily with Zen Berry — a mindful Pomodoro timer, soft task manager, and gentle productivity tracker.",
    images: [
      {
        url: "/Zen-berry Logo.png",
        width: 512,
        height: 512,
        alt: "Zen Berry logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zen Berry — Mindful Pomodoro Timer & Productivity App",
    description:
      "Focus sweetly and grow daily with Zen Berry — a mindful Pomodoro timer, soft task manager, and gentle productivity tracker.",
    images: ["/Zen-berry Logo.png"],
  },
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#86A788",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get(THEME_COOKIE_KEY)?.value ?? "light-zen"
  const themeClass = THEME_CLASS_MAP[theme] ?? ""
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-T73XRTW4"
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-ELHWZTE3SC"

  return (
    <html lang="en" className={themeClass}>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
        <script async src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`,
          }}
        />
      </head>
      <body className={nunitoSans.className}>
        <Providers>
          {children}
          <InstallPrompt />
          <CookieConsentBanner />
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
