import { Header } from "@/components/landing/Header"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/How-it-works"
import { About } from "@/components/landing/About"
import { FeedbackSection } from "@/components/landing/feedback-section"
import { Footer } from "@/components/landing/Footer"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenberry.app"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zen Berry",
  url: `${siteUrl}/landing`,
  image: `${siteUrl}/zen-berry-logo.png`,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description:
    "A free online Pomodoro timer and mindful productivity tool with Most Important Tasks, Brain Dump lists, focus streaks, and kind analytics.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Customizable Pomodoro Timer",
    "Most Important Tasks (MIT) & Brain Dump",
    "Focus Streak & Progress Tracking",
    "AI-Powered Productivity Insights",
  ],
}

/** Shared landing page layout and structured data used by `/` and `/landing`. */
export function LandingContent() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  )
}
