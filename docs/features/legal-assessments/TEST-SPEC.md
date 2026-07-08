# Test Spec: Legal Assessments (Privacy Policy & Terms of Use)

## Overview
This document describes the test strategy for the two static legal pages and the Footer component's legal links. These are pure server-rendered pages with hardcoded content, no data fetching, and no interactivity.

Since the project does not currently have a unit test runner configured, test files live under `tests/` as reference specs. They are written in a standard `describe`/`it`/`expect` pattern compatible with Vitest (recommended) or Jest. Mocking patterns use `vi.mock()` (Vitest) and can be adapted to `jest.mock()` if needed.

---

## Test Layers

### 1. Privacy Policy Page — `app/privacy/page.tsx`
**Framework**: Server component rendering test with mocked child components

#### Happy Path
- Renders page title "Privacy Policy"
- Renders "Back to Home" link pointing to "/"
- Renders all 12 section headings (numbered 1–12):
  1. Data Controller
  2. Personal Data We Collect
  3. Purpose & Legal Basis of Processing
  4. Data Sharing & Third-Party Processors
  5. Cookies & LocalStorage
  6. Data Retention
  7. Your Data Subject Rights
  8. Security Measures
  9. Cross-Border Data Transfer
  10. Children's Privacy
  11. Changes to This Policy
  12. Contact
- Renders "Norman Bautista" as the Data Controller
- Renders "dpo@zenberry.app" contact email
- Renders all 12 anchor IDs on section elements (`#data-controller`, `#personal-data`, etc.)
- Renders cookies/localStorage section with storage key names
- Renders RA 10173 rights section (7 data subject rights)
- Renders cross-border transfer section mentioning NPC Circular 16-04
- Renders children's privacy section (under 13 restriction)
- Renders Footer component

#### Edge Cases
- Page content is static and always identical regardless of session/auth state
- All 12 anchor IDs are unique and present in the DOM
- Links (Back to Home, email, etc.) have correct `href` values

#### Error Scenarios
- N/A — static content, no data fetching or user interaction

---

### 2. Terms of Use Page — `app/terms/page.tsx`
**Framework**: Server component rendering test with mocked child components

#### Happy Path
- Renders page title "Terms of Use"
- Renders "Back to Home" link pointing to "/"
- Renders all 15 section headings (numbered 1–15):
  1. Acceptance of Terms
  2. Eligibility
  3. Account Registration & Security
  4. Acceptable Use
  5. User Content & License
  6. AI Features
  7. Intellectual Property
  8. Third-Party Services
  9. Disclaimer of Warranties
  10. Limitation of Liability
  11. Indemnification
  12. Termination
  13. Governing Law & Dispute Resolution
  14. Changes to Terms
  15. Contact
- Renders "Republic of the Philippines" as governing law
- Renders "Regional Trial Court of Antipolo" as venue
- Renders eligibility age (13+ with parental consent for 13–18)
- Renders AI Features section mentioning Gemini API
- Renders contact (dpo@zenberry.app)
- Renders Footer component

#### Edge Cases
- Page content is static and always identical regardless of session/auth state
- No anchor IDs on sections (unlike privacy page — verified by implementation)

#### Error Scenarios
- N/A — static content, no data fetching or user interaction

---

### 3. Footer Component — `components/landing/Footer.tsx`
**Framework**: Component rendering test with mocked icon libraries

#### Happy Path
- Renders "Privacy" link pointing to `/privacy`
- Renders "Terms" link pointing to `/terms`
- Renders "Cookies" link pointing to `/privacy#cookies`
- Renders "Zen Berry" brand link pointing to `/`
- Renders all legal links under a "Legal" heading

#### Edge Cases
- Legal links section renders even when other sections (Product, Resources) are present
- All links are `<a>` elements (Footer uses direct `<a>` tags, not Next.js `Link`)

#### Error Scenarios
- N/A — static content, no data fetching or user interaction

---

## Mocking Strategy

### next/link
All page tests mock `next/link` as a simple `<a>` wrapper (following existing project patterns):
```ts
vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))
```

### Footer Component (for page tests)
When testing the Privacy and Terms pages, the Footer component is mocked to isolate the page under test:
```ts
vi.mock("@/components/landing/Footer", () => ({
  Footer: () => <div data-testid="footer-mock" />,
}))
```

### lucide-react Icons (for Footer test)
```ts
vi.mock("lucide-react", () => ({
  Leaf: () => <span data-testid="icon-leaf" />,
  Heart: () => <span data-testid="icon-heart" />,
  Mail: () => <span data-testid="icon-mail" />,
}))
```

### MUI Icons (for Footer test)
```ts
vi.mock("@mui/icons-material/GitHub", () => ({
  default: () => <span data-testid="icon-github" />,
}))
vi.mock("@mui/icons-material/LinkedIn", () => ({
  default: () => <span data-testid="icon-linkedin" />,
}))
```

---

## Acceptance Criteria Coverage

| AC # | Description | Test File | Test(s) |
|------|-------------|-----------|---------|
| AC1 | Privacy page renders title | `page.test.tsx` (privacy) | "renders 'Privacy Policy' as the page title" |
| AC2 | Privacy page renders all 12 section headings | `page.test.tsx` (privacy) | "renders all 12 section headings" |
| AC3 | Privacy page renders "Norman Bautista" as controller | `page.test.tsx` (privacy) | "renders Norman Bautista as data controller" |
| AC4 | Privacy page renders dpo@zenberry.app contact | `page.test.tsx` (privacy) | "renders dpo@zenberry.app contact email" |
| AC5 | Privacy page renders all 12 anchor IDs | `page.test.tsx` (privacy) | "renders all 12 anchor IDs on section elements" |
| AC6 | Privacy page renders cookies/localStorage section | `page.test.tsx` (privacy) | "renders cookies and localStorage section" |
| AC7 | Privacy page renders RA 10173 rights section | `page.test.tsx` (privacy) | "renders RA 10173 data subject rights" |
| AC8 | Privacy page renders cross-border transfer section | `page.test.tsx` (privacy) | "renders cross-border data transfer with NPC Circular 16-04" |
| AC9 | Privacy page renders children's privacy section | `page.test.tsx` (privacy) | "renders children's privacy section" |
| AC10 | Privacy page has "Back to Home" link | `page.test.tsx` (privacy) | "renders 'Back to Home' link pointing to '/'" |
| AC11 | Privacy page renders Footer | `page.test.tsx` (privacy) | "renders the Footer component" |
| AC12 | Privacy page has no "use client" directive | `page.test.tsx` (privacy) | "is a server component (no 'use client')" |
| AC13 | Terms page renders title | `page.test.tsx` (terms) | "renders 'Terms of Use' as the page title" |
| AC14 | Terms page renders all 15 section headings | `page.test.tsx` (terms) | "renders all 15 section headings" |
| AC15 | Terms page renders "Republic of the Philippines" | `page.test.tsx` (terms) | "renders Republic of the Philippines as governing law" |
| AC16 | Terms page renders "Regional Trial Court of Antipolo" | `page.test.tsx` (terms) | "renders Regional Trial Court of Antipolo as venue" |
| AC17 | Terms page renders eligibility (13+) | `page.test.tsx` (terms) | "renders eligibility age requirement" |
| AC18 | Terms page renders AI Features section | `page.test.tsx` (terms) | "renders AI Features section mentioning Gemini" |
| AC19 | Terms page renders dpo@zenberry.app contact | `page.test.tsx` (terms) | "renders dpo@zenberry.app contact email" |
| AC20 | Terms page has "Back to Home" link | `page.test.tsx` (terms) | "renders 'Back to Home' link pointing to '/'" |
| AC21 | Terms page renders Footer | `page.test.tsx` (terms) | "renders the Footer component" |
| AC22 | Terms page has no "use client" directive | `page.test.tsx` (terms) | "is a server component (no 'use client')" |
| AC23 | Footer renders Privacy link | `Footer.test.tsx` | "renders Privacy link pointing to /privacy" |
| AC24 | Footer renders Terms link | `Footer.test.tsx` | "renders Terms link pointing to /terms" |
| AC25 | Footer renders Cookies link | `Footer.test.tsx` | "renders Cookies link pointing to /privacy#cookies" |

---

## Test Cases Summary

### Privacy Page (12 tests)
1. Renders "Privacy Policy" as the page title
2. Renders all 12 section headings
3. Renders "Norman Bautista" as data controller
4. Renders "dpo@zenberry.app" contact email
5. Renders all 12 anchor IDs on section elements
6. Renders cookies and localStorage section with storage key names
7. Renders RA 10173 data subject rights (7 rights)
8. Renders cross-border data transfer with NPC Circular 16-04
9. Renders children's privacy section
10. Renders "Back to Home" link pointing to "/"
11. Renders the Footer component
12. Is a server component (no "use client" directive)

### Terms Page (10 tests)
1. Renders "Terms of Use" as the page title
2. Renders all 15 section headings
3. Renders "Republic of the Philippines" as governing law
4. Renders "Regional Trial Court of Antipolo" as venue
5. Renders eligibility age requirement (13+)
6. Renders AI Features section mentioning Gemini
7. Renders "dpo@zenberry.app" contact email
8. Renders "Back to Home" link pointing to "/"
9. Renders the Footer component
10. Is a server component (no "use client" directive)

### Footer Legal Links (3 tests)
1. Renders "Privacy" link pointing to "/privacy"
2. Renders "Terms" link pointing to "/terms"
3. Renders "Cookies" link pointing to "/privacy#cookies"

---

**Total: 25 test cases across 3 test files**
