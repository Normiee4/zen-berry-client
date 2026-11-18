import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/landing/Footer"
import { CookieSettingsButton } from "@/components/cookies/cookie-settings-button"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Zen Berry uses essential cookies, localStorage, and optional Google Analytics cookies, and manage your cookie preferences.",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <article>
          <header className="mb-12">
            <Link
              href="/"
              className="text-sm font-medium text-matcha transition-colors hover:text-matcha-dark"
            >
              &larr; Back to Home
            </Link>
            <h1 className="mt-4 mb-2 text-4xl font-bold text-matcha">
              Cookie Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: November 18, 2026
            </p>
          </header>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-matcha">
              1. What Are Cookies?
            </h2>
            <p className="mb-4 text-foreground">
              Cookies are small text files stored on your browser or device when
              you visit a website. Alongside browser{" "}
              <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                localStorage
              </code>
              , they help Zen Berry keep you signed in, remember your theme and
              timer settings, and—only with your consent—understand how visitors
              interact with our pages.
            </p>
            <div className="rounded-xl bg-matcha/10 p-5">
              <p className="mb-3 text-sm text-foreground">
                You can review or change your cookie authorization choices at
                any time:
              </p>
              <CookieSettingsButton
                label="Manage Cookie Preferences"
                className="inline-flex cursor-pointer items-center rounded-xl bg-matcha px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-matcha-dark"
              />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-matcha">
              2. Categories of Cookies We Use
            </h2>

            <h3 className="mt-6 mb-2 text-lg font-medium text-foreground">
              Strictly Necessary Cookies (Always Active)
            </h3>
            <p className="mb-4 text-foreground">
              These cookies and storage keys are required for core site
              functionality, authentication, security, and saving your cookie
              preferences. They cannot be disabled.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-matcha/20 text-foreground">
                    <th className="py-2.5 pr-4 font-semibold">Name</th>
                    <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                    <th className="py-2.5 font-semibold">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matcha/10 text-muted-foreground">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      Supabase session cookies
                    </td>
                    <td className="py-3 pr-4">
                      Authenticates and maintains your signed-in session
                      (httpOnly, secure).
                    </td>
                    <td className="py-3">Session / Auth token</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      zenberry_theme
                    </td>
                    <td className="py-3 pr-4">
                      Remembers your selected visual theme (Light Zen, Warm
                      Earth, or Cozy Dark).
                    </td>
                    <td className="py-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      zenberry_cookie_consent
                    </td>
                    <td className="py-3 pr-4">
                      Stores your cookie authorization choice so we respect your
                      preferences.
                    </td>
                    <td className="py-3">180 days</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      beta_bypass
                    </td>
                    <td className="py-3 pr-4">
                      Manages authorized beta tester access when enabled.
                    </td>
                    <td className="py-3">7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 mb-2 text-lg font-medium text-foreground">
              Analytics Cookies (Optional — Requires Consent)
            </h3>
            <p className="mb-4 text-foreground">
              With your permission, we use Google Analytics 4 (GA4) to collect
              aggregated, non-personally-identifiable insights about page views
              and feature usage so we can improve Zen Berry.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-matcha/20 text-foreground">
                    <th className="py-2.5 pr-4 font-semibold">Name</th>
                    <th className="py-2.5 pr-4 font-semibold">Provider</th>
                    <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                    <th className="py-2.5 font-semibold">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matcha/10 text-muted-foreground">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      _ga
                    </td>
                    <td className="py-3 pr-4">Google Analytics</td>
                    <td className="py-3 pr-4">
                      Distinguishes unique visitors for aggregated traffic
                      measurement.
                    </td>
                    <td className="py-3">Up to 2 years</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      _ga_*
                    </td>
                    <td className="py-3 pr-4">Google Analytics</td>
                    <td className="py-3 pr-4">
                      Maintains session state for GA4 property analytics.
                    </td>
                    <td className="py-3">Up to 2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-matcha">
              3. LocalStorage Preferences
            </h2>
            <p className="mb-4 text-foreground">
              Zen Berry also stores non-tracking timer and UI preferences in
              your browser&apos;s{" "}
              <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                localStorage
              </code>
              :
            </p>
            <ul className="list-disc space-y-2 pl-6 text-foreground">
              <li>
                <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                  zenberry_timer_presets
                </code>{" "}
                &mdash; Custom Pomodoro timer preset configurations
              </li>
              <li>
                <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                  zenberry_timer_streak
                </code>{" "}
                &mdash; Current focus streak count
              </li>
              <li>
                <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                  zenberry_active_session
                </code>{" "}
                &mdash; Active timer session state
              </li>
              <li>
                <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                  zenberry_timer_alarm_sound
                </code>{" "}
                &mdash; Selected alarm sound preference
              </li>
              <li>
                <code className="rounded bg-matcha/10 px-1.5 py-0.5 text-sm">
                  zenberry_cookie_consent
                </code>{" "}
                &mdash; Saved cookie authorization preferences
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-matcha">
              4. How to Control or Delete Cookies
            </h2>
            <p className="mb-4 text-foreground">
              You can accept, reject, or customize optional analytics cookies
              using our Cookie Authorization Panel at any time. You can also
              clear or block cookies in your browser settings. Note that
              disabling strictly necessary cookies may prevent sign-in and core
              app features from working properly.
            </p>
            <p className="text-foreground">
              For more details on how we handle your data, please read our{" "}
              <Link
                href="/privacy"
                className="font-medium text-matcha underline hover:text-matcha-dark"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-matcha">
              5. Contact
            </h2>
            <p className="text-foreground">
              If you have questions about this Cookie Policy, please contact our
              Data Protection Officer at{" "}
              <a
                href="mailto:dpo@zenberry.app"
                className="text-matcha underline transition-colors hover:text-matcha-dark"
              >
                dpo@zenberry.app
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
