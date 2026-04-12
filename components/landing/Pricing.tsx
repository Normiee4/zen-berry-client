"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Pricing() {
  return (
    <section id="pricing" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-matcha via-matcha to-matcha-light p-8 sm:p-12 lg:p-16">
          {/* Background Decoration */}
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-strawberry/20 blur-3xl" />
          
          {/* Floating Decorations */}
          <div className="absolute right-10 top-10 text-4xl opacity-20">🍓</div>
          <div className="absolute bottom-10 left-10 text-4xl opacity-20">🍵</div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
              <Sparkles className="size-4" />
              <span>Free to get started</span>
            </div>
            
            {/* Headline */}
            <h2 className="mb-4 text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to focus without
              <br />
              the burnout?
            </h2>
            
            {/* Subheadline */}
            <p className="mb-8 max-w-xl text-pretty text-lg text-white/80">
              Join thousands of mindful achievers who&apos;ve found a gentler way to be productive. 
              Start your journey today.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-white px-8 text-matcha hover:bg-strawberry-light hover:text-foreground"
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                View Pricing
              </Button>
            </div>
            
            {/* Trust Badge */}
            <p className="mt-8 text-sm text-white/60">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
