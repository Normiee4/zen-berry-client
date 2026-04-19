"use client"

import { MatchaCupIllustration } from "@/components/landing/illustrations/Matcha-cup"
import { ProductivityDashboard } from "@/components/landing/illustrations/Productivity-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-cream via-strawberry-light/30 to-matcha-light/20">
      {/* Morphed Wavy Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large matcha blob - top right */}
        <svg
          className="absolute -right-32 -top-32 h-37.5 w-37.5 opacity-40"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#B8D4B8"
            d="M44.3,-76.5C57.9,-69.5,69.8,-58.4,77.5,-44.8C85.2,-31.2,88.7,-15.6,87.7,-0.6C86.7,14.5,81.1,28.9,73.1,42.1C65.1,55.2,54.6,67,41.5,74.4C28.4,81.7,12.7,84.6,-2.5,88.9C-17.8,93.2,-35.5,98.9,-49.4,92.1C-63.3,85.3,-73.3,66,-79.3,46.7C-85.3,27.5,-87.3,8.3,-83.8,-9.3C-80.3,-26.9,-71.4,-43,-59.1,-55.2C-46.9,-67.4,-31.4,-75.7,-15.3,-79.5C0.8,-83.3,30.7,-83.5,44.3,-76.5Z"
            transform="translate(100 100)"
          />
        </svg>
        
        {/* Medium strawberry blob - bottom left */}
        <svg
          className="absolute -bottom-20 -left-20 h-31.25 w-31.25 opacity-50"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFE2E2"
            d="M39.5,-65.8C52.9,-59.5,66.8,-52.5,74.8,-41.2C82.8,-29.9,84.9,-14.9,83.8,-0.6C82.7,13.7,78.5,27.4,71.3,39.8C64.1,52.2,54,63.3,41.4,70.8C28.8,78.3,13.7,82.1,-1.4,84.5C-16.5,87,-33,88,-46.4,81.4C-59.8,74.9,-70.1,60.8,-77.3,45.5C-84.5,30.1,-88.6,13.6,-87.1,0.9C-85.6,-11.8,-78.5,-21.1,-70.4,-29.7C-62.2,-38.2,-53.1,-46,-42.6,-54.2C-32.1,-62.4,-20.3,-71,-6.3,-71.3C7.6,-71.6,26.1,-72.1,39.5,-65.8Z"
            transform="translate(100 100)"
          />
        </svg>
        
        {/* Small accent blob - center */}
        <svg
          className="absolute left-1/3 top-1/4 h-18.75 w-18.75 opacity-30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFCFCF"
            d="M47.7,-79.1C62.3,-72.5,75,-61.1,82.8,-46.8C90.6,-32.5,93.5,-15.3,91.1,-0.1C88.7,15.1,81.1,28.3,72.4,40.6C63.7,52.9,53.9,64.2,41.5,71.7C29.1,79.2,14.6,82.8,-0.8,84.2C-16.2,85.6,-32.3,84.8,-45.9,78.4C-59.4,72,-70.3,60,-77.2,46C-84.1,32,-87,16,-86.3,0.4C-85.6,-15.2,-81.3,-30.4,-73.3,-43.2C-65.4,-56,-53.7,-66.3,-40.4,-73.7C-27.1,-81.2,-12.2,-85.7,2.4,-89.9C17.1,-94.2,33.1,-85.8,47.7,-79.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-strawberry px-4 py-1.5 text-sm font-medium text-foreground">
              <Sparkles className="size-4" />
              <span>Your mindful productivity companion</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-balance text-4xl text-matcha font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Focus sweetly,{" "}
              <span className="relative">
                <span className="relative z-10">grow daily</span>
                <span className="absolute bottom-2 left-0 z-0 h-3 w-full bg-strawberry/60" />
              </span>{" "}
              <span className="inline-block">🍓</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-lg text-pretty text-lg text-muted-foreground">
              A strawberry-matcha productivity app with a sustainable Pomodoro timer. 
              Gently grow your mind with gentle tracking — designed to keep you calm and focused.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                asChild
                size="lg" 
                className="bg-matcha px-8 text-white hover:bg-matcha/90"
              >
                <Link href="/auth/waitlist" className="inline-flex items-center gap-2">
                  Get Started — It&apos;s Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-matcha/30 bg-white/50 text-foreground hover:bg-strawberry-light hover:text-foreground"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-cream bg-linear-to-br from-strawberry to-matcha-light text-xs font-medium text-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,400+</span> focused minds growing daily
              </p>
            </div>
          </div>

          {/* Right Content - Combined Illustration */}
          <div className="relative flex items-center justify-center">
            {/* Small accent blurs for depth */}
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-linear-to-br from-matcha-light/30 to-matcha/10 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 size-32 rounded-full bg-linear-to-tr from-strawberry/30 to-strawberry-light/20 blur-2xl" />
            
            {/* Dashboard Preview */}
            <div className="relative z-10 w-full max-w-md">
              <ProductivityDashboard />
              
              {/* Cute Matcha Cup - Floating */}
              <div className="absolute -bottom-8 -right-4 z-20 lg:-bottom-12 lg:-right-8">
                <MatchaCupIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#FFFDEC"
          />
        </svg>
      </div>
    </section>
  )
}
