import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Header } from "@/components/landing/Header"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/How-it-works"
import { About } from "@/components/landing/About"
import { FeedbackSection } from "@/components/landing/feedback-section"
import { Footer } from "@/components/landing/Footer"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const betaCookie = cookieStore.get('beta_bypass')

  if (betaCookie?.value === 'true') {
    redirect('/dashboard')
  }

  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
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