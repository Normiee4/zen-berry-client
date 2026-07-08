import Link from "next/link"
import { Footer } from "@/components/landing/Footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <Link
            href="/"
            className="text-matcha hover:text-matcha-dark transition-colors text-sm font-medium"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-matcha mt-4 mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: July 8, 2026
          </p>
        </header>

        <section id="data-controller" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            1. Data Controller
          </h2>
          <p className="text-foreground mb-4">
            Zen Berry is operated by Norman Bautista, an individual developer
            based in the Republic of the Philippines. For purposes of the
            Philippine Data Privacy Act (RA 10173), Norman Bautista is the Data
            Controller responsible for the processing of your personal data.
          </p>
          <div className="bg-matcha/10 rounded-xl p-6">
            <p className="text-foreground font-medium">Norman Bautista</p>
            <p className="text-muted-foreground mt-1">
              3rd Floor, Manila East Arcade II
            </p>
            <p className="text-muted-foreground">
              Don Hilario Cruz Ave, Taytay, Lalawigan ng Rizal
            </p>
            <p className="text-muted-foreground">Philippines</p>
            <p className="mt-2">
              <a
                href="mailto:dpo@zenberry.app"
                className="text-matcha hover:text-matcha-dark transition-colors underline"
              >
                dpo@zenberry.app
              </a>
            </p>
          </div>
        </section>

        <section id="personal-data" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            2. Personal Data We Collect
          </h2>
          <p className="text-foreground mb-4">
            We collect and process the following categories of personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Account Information:</strong>{" "}
              Full name, email address, and hashed password (if you register
              with email). If you sign in via Google OAuth, we receive your
              name, email address, and profile avatar from your Google account.
            </li>
            <li>
              <strong className="text-strawberry">Task Data:</strong> Task
              titles, task types, and completion status.
            </li>
            <li>
              <strong className="text-strawberry">Pin Board Data:</strong>{" "}
              Headings, content, color assignments, and position coordinates.
            </li>
            <li>
              <strong className="text-strawberry">Timer Sessions:</strong>{" "}
              Session duration, break mode selection, and timer preset used.
            </li>
            <li>
              <strong className="text-strawberry">Timer Presets:</strong>{" "}
              Preset name, focus duration, and break duration.
            </li>
            <li>
              <strong className="text-strawberry">AI Insights:</strong>{" "}
              Anonymized productivity statistics and AI-generated review content.
              No personally identifiable information is sent to the AI.
            </li>
            <li>
              <strong className="text-strawberry">Reviews:</strong> Star rating,
              text answers, and additional feedback. Reviews are publicly
              displayed on our website.
            </li>
            <li>
              <strong className="text-strawberry">Bug Reports:</strong> Issue
              description, explanation, and suggested fix.
            </li>
            <li>
              <strong className="text-strawberry">Waitlist Information:</strong>{" "}
              Email address and optional name provided during waitlist signup.
            </li>
          </ul>
        </section>

        <section id="purpose-basis" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            3. Purpose & Legal Basis of Processing
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-matcha-light">
                  <th className="py-3 pr-4 font-semibold text-foreground">
                    Processing Activity
                  </th>
                  <th className="py-3 pr-4 font-semibold text-foreground">
                    Purpose
                  </th>
                  <th className="py-3 font-semibold text-foreground">
                    Legal Basis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-matcha-light/50 text-foreground">
                <tr>
                  <td className="py-3 pr-4">Account management</td>
                  <td className="py-3 pr-4">
                    Provide core app functionality
                  </td>
                  <td className="py-3">Contractual necessity</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    Task, pin, timer management
                  </td>
                  <td className="py-3 pr-4">
                    Deliver core productivity features
                  </td>
                  <td className="py-3">Contractual necessity</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    Public reviews & ratings
                  </td>
                  <td className="py-3 pr-4">
                    Display user feedback on website
                  </td>
                  <td className="py-3">Consent</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Waitlist management</td>
                  <td className="py-3 pr-4">
                    Notify when app is available
                  </td>
                  <td className="py-3">Consent</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Bug report analysis</td>
                  <td className="py-3 pr-4">
                    Improve app stability and fix issues
                  </td>
                  <td className="py-3">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    AI Review (Gemini API)
                  </td>
                  <td className="py-3 pr-4">
                    Generate productivity insights (anonymized)
                  </td>
                  <td className="py-3">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Google OAuth sign-in</td>
                  <td className="py-3 pr-4">
                    Allow authentication via Google
                  </td>
                  <td className="py-3">Consent (Google prompt)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="data-sharing" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            4. Data Sharing & Third-Party Processors
          </h2>
          <p className="text-foreground mb-4">
            We share your personal data with the following third-party service
            providers who act as data processors:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Supabase Inc. (United States):</strong>{" "}
              Database hosting, authentication, and file storage. Your account
              information, tasks, pins, timer sessions, presets, reviews, and
              bug reports are stored on Supabase&apos;s infrastructure.
            </li>
            <li>
              <strong className="text-strawberry">Google LLC (United States):</strong>{" "}
              Provides Google OAuth authentication and the Gemini AI API used
              for AI-powered productivity insights. Only anonymized,
              non-personally-identifiable productivity statistics are sent to
              Gemini AI. No names, email addresses, or other personal
              identifiers are included in AI processing.
            </li>
          </ul>
        </section>

        <section id="cookies" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            5. Cookies & LocalStorage
          </h2>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Cookies
          </h3>
          <p className="text-foreground mb-4">
            We use the following cookies on our website:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Supabase session cookies:</strong>{" "}
              Strictly necessary cookies for authentication and maintaining your
              logged-in session. These are httpOnly and secure.
            </li>
            <li>
              <strong className="text-strawberry">beta_bypass:</strong> A cookie
              used to manage beta access authorization. Set only for authorized
              beta testers.
            </li>
          </ul>
          <h3 className="text-lg font-medium text-foreground mt-6 mb-2">
            LocalStorage
          </h3>
          <p className="text-foreground mb-4">
            We use the following localStorage keys to store client-side
            preferences:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <code className="bg-matcha/10 px-1.5 py-0.5 rounded text-sm">
                zenberry_timer_presets
              </code>{" "}
              &mdash; Custom timer preset configurations
            </li>
            <li>
              <code className="bg-matcha/10 px-1.5 py-0.5 rounded text-sm">
                zenberry_timer_streak
              </code>{" "}
              &mdash; Current focus streak count
            </li>
            <li>
              <code className="bg-matcha/10 px-1.5 py-0.5 rounded text-sm">
                zenberry_active_session
              </code>{" "}
              &mdash; Active timer session state
            </li>
            <li>
              <code className="bg-matcha/10 px-1.5 py-0.5 rounded text-sm">
                zenberry_timer_alarm_sound
              </code>{" "}
              &mdash; Selected alarm sound preference
            </li>
          </ul>
        </section>

        <section id="data-retention" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            6. Data Retention
          </h2>
          <p className="text-foreground mb-4">
            We retain your personal data for as long as your account is active
            or as needed to provide you with our services.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Account data:</strong>{" "}
              Retained until you delete your account or request erasure.
            </li>
            <li>
              <strong className="text-strawberry">Public reviews:</strong>{" "}
              Reviews you submit may persist on the website even after account
              deletion, as they are anonymized and serve as community content.
              You may request removal of your review at any time.
            </li>
            <li>
              <strong className="text-strawberry">Bug reports:</strong>{" "}
              Retained for product improvement purposes. Bug reports are
              anonymized after resolution.
            </li>
            <li>
              <strong className="text-strawberry">Waitlist data:</strong>{" "}
              Retained until you are notified of app availability or upon your
              request for removal.
            </li>
          </ul>
        </section>

        <section id="rights" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            7. Your Data Subject Rights
          </h2>
          <p className="text-foreground mb-4">
            Under the Philippine Data Privacy Act (RA 10173), you have the
            following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Right to be Informed:</strong>{" "}
              To know how your personal data is being processed. This Privacy
              Policy serves as our privacy notice.
            </li>
            <li>
              <strong className="text-strawberry">Right to Access:</strong> To
              request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-strawberry">Right to Correction:</strong>{" "}
              To request correction of inaccurate or incomplete personal data.
            </li>
            <li>
              <strong className="text-strawberry">
                Right to Erasure or Blocking:
              </strong>{" "}
              To request suspension, withdrawal, or removal of your personal
              data from our records.
            </li>
            <li>
              <strong className="text-strawberry">Right to Portability:</strong>{" "}
              To receive your personal data in a commonly used, machine-readable
              format, or to have it transmitted to another data controller.
            </li>
            <li>
              <strong className="text-strawberry">
                Right to Withdraw Consent:
              </strong>{" "}
              To withdraw your consent at any time, without affecting the
              lawfulness of processing based on consent before its withdrawal.
            </li>
            <li>
              <strong className="text-strawberry">
                Right to File a Complaint:
              </strong>{" "}
              To file a complaint with the National Privacy Commission (NPC) if
              you believe your data privacy rights have been violated.
            </li>
          </ul>
          <p className="text-foreground mt-4">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:dpo@zenberry.app"
              className="text-matcha hover:text-matcha-dark transition-colors underline"
            >
              dpo@zenberry.app
            </a>
            . We will respond to your request within the timeframe required by
            law.
          </p>
        </section>

        <section id="security" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            8. Security Measures
          </h2>
          <p className="text-foreground mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Row-Level Security (RLS):</strong>{" "}
              All Supabase database tables are protected by RLS policies,
              ensuring users can only access their own data.
            </li>
            <li>
              <strong className="text-strawberry">Secure Cookies:</strong>{" "}
              Session cookies are httpOnly and secure, preventing access via
              client-side scripts.
            </li>
            <li>
              <strong className="text-strawberry">Input Validation:</strong> All
              user input is validated using Zod schemas to prevent injection
              attacks.
            </li>
            <li>
              <strong className="text-strawberry">Rate Limiting:</strong> Rate
              limiting is applied to authentication and AI endpoints to prevent
              abuse.
            </li>
            <li>
              <strong className="text-strawberry">
                AI Processing Safeguards:
              </strong>{" "}
              No personally identifiable information is sent to Gemini AI. Only
              anonymized productivity statistics are processed.
            </li>
          </ul>
        </section>

        <section id="cross-border" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            9. Cross-Border Data Transfer
          </h2>
          <p className="text-foreground mb-4">
            Your personal data may be transferred to and processed in countries
            outside the Philippines where our third-party service providers
            operate.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Supabase Inc.:</strong> Data
              is stored on servers located in the United States.
            </li>
            <li>
              <strong className="text-strawberry">Google LLC:</strong> Data
              processed for OAuth and Gemini AI is handled on servers located in
              the United States.
            </li>
          </ul>
          <p className="text-foreground mt-4">
            We ensure that appropriate safeguards are in place for such
            transfers in compliance with NPC Circular 16-04, including entering
            into data processing agreements that require the recipient to
            implement data protection standards equivalent to those under
            Philippine law.
          </p>
        </section>

        <section id="children" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            10. Children&apos;s Privacy
          </h2>
          <p className="text-foreground mb-4">
            Zen Berry is not intended for use by individuals under the age of
            13. We do not knowingly collect personal data from children under
            13. If you are under 13, please do not use or provide any
            information through this application.
          </p>
          <p className="text-foreground">
            If you are between 13 and 18 years old, you may use Zen Berry only
            with the consent of a parent or legal guardian. If we learn that we
            have collected personal data from a child under 13 without
            verification of parental consent, we will take steps to delete that
            information promptly.
          </p>
        </section>

        <section id="changes" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            11. Changes to This Policy
          </h2>
          <p className="text-foreground mb-4">
            We may update this Privacy Policy from time to time. When we make
            changes, we will revise the &quot;Last updated&quot; date at the top
            of this page and notify you via email or in-app notification,
            depending on the significance of the changes.
          </p>
          <p className="text-foreground">
            We encourage you to review this Privacy Policy periodically to stay
            informed about how we are protecting your personal data. Your
            continued use of Zen Berry after changes to this policy constitutes
            your acceptance of the updated policy.
          </p>
        </section>

        <section id="contact" className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            12. Contact
          </h2>
          <p className="text-foreground mb-4">
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or our data processing practices, please contact our
            Data Protection Officer:
          </p>
          <div className="bg-matcha/10 rounded-xl p-6">
            <p className="text-foreground font-medium">
              Norman Bautista (Data Protection Officer)
            </p>
            <p className="text-muted-foreground mt-1">
              3rd Floor, Manila East Arcade II
            </p>
            <p className="text-muted-foreground">
              Don Hilario Cruz Ave, Taytay, Lalawigan ng Rizal
            </p>
            <p className="text-muted-foreground">Philippines</p>
            <p className="mt-2">
              <a
                href="mailto:dpo@zenberry.app"
                className="text-matcha hover:text-matcha-dark transition-colors underline"
              >
                dpo@zenberry.app
              </a>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
