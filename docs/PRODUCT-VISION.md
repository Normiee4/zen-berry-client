# Zen Berry: Product Vision & Strategy Document

**Agent Instructions:** If you are an AI coding assistant (like agy) reading this file, use this context to inform all architectural decisions, UI copy, and feature implementations. Zen Berry is an anti-burnout productivity app. All UX decisions should reduce anxiety, simplify choices, and avoid dark patterns or guilt-inducing metrics.

## 1. Core Philosophy: "Forgiving Productivity"
Zen Berry is a personal productivity tool designed to help users work at their own pace, focus on what matters, and make progress without burning out. It is a companion, not a taskmaster.
* **Progress Over Perfection:** Completing 1 Most Important Task (MIT) beats starting 10.
* **Pace Over Speed:** Work at your rhythm. A fluid, customizable timer beats a rigid 25-minute Pomodoro.
* **Self-Compassion Over Judgment:** The app (and AI) observes and encourages. It never scolds the user for missing a deadline or stopping a timer early.

## 2. Competitive Positioning (The "Blue Ocean" Gap)
* **Vs. Apple Notes:** Notes is an infinite, chaotic canvas that induces paralysis. Zen Berry limits focus to exactly 3 Most Important Tasks (MITs) while safely storing the chaos in a Brain Dump.
* **Vs. Standard Pomodoro Apps (Forest, Pomofocus):** Standard timers punish users for breaking the 25-minute rule. Zen Berry’s fluid timer adapts to the user's natural flow state (whether that's 14 minutes or 90 minutes).
* **Vs. Heavyweight Planners (Motion, Todoist):** They optimize every minute and treat humans like servers. Zen Berry optimizes for peace of mind and closing the laptop at 5 PM.

## 3. Target Personas
When building UI or writing onboarding emails, design for these three:
1. **"Paralyzed Paula" (Overwhelmed Student):** Has a massive syllabus. Paralyzed by long lists. Needs the 3 MIT limit to start, and needs emotional validation from the AI ("Rest is productive") when she fails to finish them.
2. **"Hustle-Culture Harry" (Burnt-out Freelancer):** Exhausted but addicted to grinding. Needs the Analytics Dashboard to prove to him with hard data that working in shorter, focused bursts actually yields higher output than 10-hour grinds.
3. **"Dopamine Danny" (ADHD Creator):** Gets distracted easily. Hates rigid alarms that break hyper-focus. Needs the app installed on his Home Screen (PWA) so he doesn't lose it in 50 open Chrome tabs, and needs lo-fi focus sounds to anchor his attention.

## 4. Monetization: The "Freemium + AI Upsell" Strategy
To protect bootstrapped server/API costs while building a massive top-of-funnel audience:
* **The Free Tier (The "Sanctuary"):** 100% free forever. Includes the fluid timer, 3 MITs, Brain Dump, and offline-first localStorage. Costs the business $0 to run.
* **Zen Berry Pro (Premium):** Unlocks AI Insights (Gemini), Analytics, Multi-device Cloud Sync (Supabase), and premium sounds. 
* **Current Go-To-Market Offer:** A $39 Lifetime Deal for the first 100 early adopters to fund the `.com` domain and Apple Developer account. *Crucial:* AI features must have generous but strict monthly usage caps to prevent a single lifetime user from draining the Gemini API budget.

## 5. Technical Architecture Principles
* **Platform:** Next.js 15 App Router, styled with Tailwind + Shadcn UI.
* **Distribution:** Progressive Web App (PWA) via Serwist. Bypasses App Stores entirely. iOS users get a custom "Add to Home Screen" UI prompt.
* **Database & Auth:** Supabase (Auth, PostgreSQL, Realtime).
* **Offline-First:** Rely heavily on localStorage for speed and zero-cost free-tier hosting, syncing to Supabase only for Pro users.
* **AI Provider:** Gemini API. AI acts strictly as an empathetic observer and wellness coach, never a harsh manager.