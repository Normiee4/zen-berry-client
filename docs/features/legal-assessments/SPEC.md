# Feature: Legal Assessments

- **Type:** new
- **Status:** new
- **Created:** 2026-07-08
- **Updated:** 2026-07-08

## Overview

Create two static legal pages — Privacy Policy (`/privacy`) and Terms of Use (`/terms`) — for Zen Berry, a productivity webapp (Pomodoro timer, task management, AI insights) built with Next.js. Both pages comply with the **Philippine Data Privacy Act (RA 10173)**. The data controller is **Norman Bautista** (individual) with legal venue at the **Regional Trial Court of Antipolo, Philippines**.

The existing landing page `Footer` component is also updated to link to these real pages instead of placeholder `#` hrefs.

---

## Requirements

1. `/privacy` renders a complete Privacy Policy with all 12 sections enumerated below, including anchor IDs for direct section linking (e.g., `#cookies`, `#rights`, `#contact`).
2. `/terms` renders a complete Terms of Use with all 15 sections enumerated below.
3. Both pages are **server components** (no `"use client"` directive) and render as static HTML — no dynamic data fetching.
4. Both pages use Zen Berry's Tailwind design system: `bg-cream`, `text-foreground`, matcha accent headings, strawberry emphasis, `max-w-3xl mx-auto` responsive layout.
5. Both pages include:
   - A simple header with "Zen Berry" home link and back-to-home navigation.
   - The existing `Footer` component at the bottom.
6. The existing `components/landing/Footer.tsx` legal links array is updated to point to real URLs.
7. All personal data processing descriptions must be accurate per the audited database schema.
8. RA 10173 data subject rights must be listed with instructions on how to exercise them.
9. Governing law: **Republic of the Philippines**. Dispute venue: **Regional Trial Court of Antipolo**.
10. Controller identity: **Norman Bautista** with full address in **Taytay, Rizal**.
11. Contact email for privacy matters: **dpo@zenberry.app**.

---

## Implementation Plan

### Files to Create

#### 1. `app/privacy/page.tsx` — Privacy Policy

Server component (no `"use client"`). Content sections with anchor IDs:

| # | Section | Anchor ID | Key Content |
|---|---------|-----------|-------------|
| 1 | **Data Controller** | `#data-controller` | Norman Bautista, 3rd Floor, Manila East Arcade II, Don Hilario Cruz Ave, Taytay, Rizal. Contact email. |
| 2 | **Personal Data Collected** | `#personal-data` | Full name, email, hashed password, Google OAuth profile (name, email, avatar), tasks (title, type, completion status), pins (heading, content, color, position), timer sessions (duration, break mode, preset), timer presets (name, focus/break durations), AI insights (anonymized stats, AI reviews), reviews (rating, text answers, additional feedback — publicly displayed), bug reports (issue, explanation, suggestions), waitlist info (email, optional name). |
| 3 | **Purpose & Legal Basis of Processing** | `#purpose-basis` | Table format: Core features → Contractual necessity; Reviews → Consent; Waitlist → Consent; Bug reports → Legitimate interest; AI Review (Gemini) → Legitimate interest (anonymized, no PII); OAuth → Consent (Google prompt). |
| 4 | **Data Sharing & Third-Party Processors** | `#data-sharing` | Supabase Inc (US) — database hosting, authentication. Google LLC (US) — OAuth provider, Gemini AI API (anonymized stats). |
| 5 | **Cookies & LocalStorage** | `#cookies` | Supabase session cookies (strictly necessary), `beta_bypass` cookie (beta access). localStorage: `zenberry_timer_presets`, `zenberry_timer_streak`, `zenberry_active_session`, `zenberry_timer_alarm_sound`. |
| 6 | **Data Retention** | `#data-retention` | Personal data kept until account deletion. Reviews (public) may persist after deletion. Bug reports retained for product improvement. |
| 7 | **Data Subject Rights** | `#rights` | Right to be informed, access, correction, erasure/blocking, portability, withdraw consent, file complaint with NPC. Exercise via dpo@zenberry.app. |
| 8 | **Security Measures** | `#security` | RLS on all Supabase tables, httpOnly/secure cookies, Zod input validation, rate limiting on auth & AI endpoints, no PII sent to Gemini AI. |
| 9 | **Cross-Border Data Transfer** | `#cross-border` | Data stored on Supabase (US), sent to Google (US) for OAuth & Gemini. Safeguards per NPC Circular 16-04. |
| 10 | **Children's Privacy** | `#children` | Not intended for users under 13 (or 18+ without parental consent). No data knowingly collected from children. |
| 11 | **Changes to This Policy** | `#changes` | Policy versioning with effective date. Notified via email or in-app notice. |
| 12 | **Contact** | `#contact` | dpo@zenberry.app — Norman Bautista, full address in Taytay, Rizal. |

#### 2. `app/terms/page.tsx` — Terms of Use

Server component (no `"use client"`). Content sections:

| # | Section | Key Content |
|---|---------|-------------|
| 1 | **Acceptance of Terms** | By using Zen Berry, user agrees to these terms. |
| 2 | **Eligibility** | Must be 13+ (or 18+ without parental consent per RA 10173). |
| 3 | **Account Registration & Security** | User responsible for password confidentiality and accurate info. |
| 4 | **Acceptable Use** | No illegal activity, abuse, spam, scraping, interference. |
| 5 | **User Content & License** | User retains ownership. Reviews: license to display publicly. Feedback: license for product improvement. |
| 6 | **AI Features** | AI Review uses Gemini with anonymized data only. User can opt out by not using the feature. |
| 7 | **Intellectual Property** | Brand, design, code owned by Norman Bautista. |
| 8 | **Third-Party Services** | Supabase, Google (OAuth, Gemini). Each governed by their own terms. |
| 9 | **Disclaimer of Warranties** | Service "as is" without warranties. |
| 10 | **Limitation of Liability** | To extent permitted by law. RA 10173 statutory rights not affected. |
| 11 | **Indemnification** | User indemnifies Norman Bautista for ToS violations. |
| 12 | **Termination** | Accounts may be suspended/terminated for violations. |
| 13 | **Governing Law & Dispute Resolution** | Laws of Republic of the Philippines. Disputes at Regional Trial Court of Antipolo. |
| 14 | **Changes to Terms** | Updated terms posted with effective date. |
| 15 | **Contact** | dpo@zenberry.app |

### Files to Modify

#### 3. `components/landing/Footer.tsx`

Change the `legal` array from placeholder `#` hrefs to real URLs:

```diff
 legal: [
-  { label: "Privacy", href: "#" },
-  { label: "Terms", href: "#" },
-  { label: "Cookies", href: "#" },
+  { label: "Privacy", href: "/privacy" },
+  { label: "Terms", href: "/terms" },
+  { label: "Cookies", href: "/privacy#cookies" },
 ],
```

### Design & Styling

- **Framework:** Tailwind CSS (existing Zen Berry design system).
- **Layout:** `max-w-3xl mx-auto` with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).
- **Colors:**
  - Background: `bg-cream` / `bg-background`
  - Body text: `text-foreground` / `text-muted-foreground`
  - Headings: matcha green accent (`text-matcha` or `text-primary`)
  - Emphasis/strong text: strawberry accent (`text-strawberry` or `text-accent`)
  - Links: matcha accent with hover underline.
- **Typography:** Use standard HTML headings (`h1`–`h3`), paragraphs, and lists, styled with Tailwind utilities (no `@tailwindcss/typography` prose plugin required — use manual classes).
- **Sections:** Each section wrapped in `<section>` with `id` attribute for anchor linking.
- **Data Controller Info:** Contact details in a highlighted card/box for prominence.

### Architecture Decisions

- **Server components only** — both pages are static, no hydration needed, no client-side interactivity.
- **No data fetching** — all content is hardcoded JSX/TSX strings. No calls to database, API routes, or CMS.
- **Footer reuse** — import the existing `Footer` component from `@/components/landing/Footer`.
- **Anchor navigation** — privacy page uses `id` attributes matching the anchor table above so the cookies link (`/privacy#cookies`) scrolls to the correct section.
- **No i18n** — all content in English (as the app's primary language).

---

## Out of Scope (Not Yet)

- Analytics cookies (PostHog/GA4) — not implemented, so cookie section covers only current cookies + localStorage.
- Consent checkboxes on signup — will be a separate feature.
- Account deletion endpoint — will be a separate feature.
- Data export endpoint — will be a separate feature.
- Cookie consent banner — will be a separate feature.
- Privacy policy versioning system / changelog CMS — content is hardcoded for now.
- Dynamic date injection (last updated date is hardcoded).

---

## Acceptance Criteria

- [ ] `/privacy` renders a complete Privacy Policy with all 12 required sections.
- [ ] `/privacy` sections have anchor IDs matching the specification (`#data-controller`, `#personal-data`, `#purpose-basis`, `#data-sharing`, `#cookies`, `#data-retention`, `#rights`, `#security`, `#cross-border`, `#children`, `#changes`, `#contact`).
- [ ] `/terms` renders a complete Terms of Use with all 15 required sections.
- [ ] Footer "Privacy" link points to `/privacy`.
- [ ] Footer "Terms" link points to `/terms`.
- [ ] Footer "Cookies" link points to `/privacy#cookies`.
- [ ] Both pages include the existing `Footer` component at the bottom.
- [ ] Both pages are server components (no `"use client"` directive).
- [ ] Both pages use Zen Berry's Tailwind design system (`bg-cream`, `text-foreground`, matcha accent headings, responsive `max-w-3xl mx-auto` layout).
- [ ] All personal data processing descriptions accurately reflect the audited database schema (tasks, pins, timer sessions, presets, reviews, reports, waitlist, AI insights).
- [ ] RA 10173 data subject rights (right to be informed, access, correction, erasure, portability, withdraw consent, file NPC complaint) are listed with clear exercise instructions.
- [ ] Governing law is stated as the Republic of the Philippines.
- [ ] Dispute venue is the Regional Trial Court of Antipolo, Philippines.
- [ ] Data controller is identified as Norman Bautista with address: 3rd Floor, Manila East Arcade II, Don Hilario Cruz Ave, Taytay, Lalawigan ng Rizal.
- [ ] Contact email for privacy matters is **dpo@zenberry.app**.
- [ ] Privacy policy includes a section on cross-border data transfers with safeguards per NPC Circular 16-04.
- [ ] Privacy policy includes a section on children's privacy (not for users under 13).
- [ ] Terms of Use include an eligibility section (13+ or 18+ with parental consent).
- [ ] Terms of Use include AI features section noting Gemini uses anonymized data only.
- [ ] Both pages render as static HTML with no dynamic data fetching.
