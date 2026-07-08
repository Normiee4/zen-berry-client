import Link from "next/link"
import { Footer } from "@/components/landing/Footer"

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: July 8, 2026
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-foreground">
            By accessing or using Zen Berry (&quot;the Application&quot;), you
            agree to be bound by these Terms of Use (&quot;Terms&quot;). If you
            do not agree to all of these Terms, you must not access or use the
            Application. These Terms apply to all visitors, users, and others
            who access or use the Application.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            2. Eligibility
          </h2>
          <p className="text-foreground mb-4">
            By using Zen Berry, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              You are at least 13 years of age, or if you are between 13 and 18
              years of age, you have obtained the consent of your parent or
              legal guardian to use the Application.
            </li>
            <li>
              You are not under the age of 13. If you are under 13, you are not
              permitted to use Zen Berry or provide any personal information
              through the Application.
            </li>
            <li>
              You have the full power and authority to enter into these Terms.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            3. Account Registration & Security
          </h2>
          <p className="text-foreground mb-4">
            To access certain features of the Application, you may be required
            to create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              Provide accurate, current, and complete information during the
              registration process.
            </li>
            <li>
              Maintain the confidentiality of your account credentials,
              including your password.
            </li>
            <li>
              Notify us immediately of any unauthorized use of your account or
              any other breach of security.
            </li>
            <li>
              Accept responsibility for all activities that occur under your
              account.
            </li>
          </ul>
          <p className="text-foreground mt-4">
            We reserve the right to suspend or terminate accounts that violate
            these Terms or that provide false, inaccurate, or outdated
            information.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            4. Acceptable Use
          </h2>
          <p className="text-foreground mb-4">
            You agree to use Zen Berry only for lawful purposes and in
            accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              Use the Application for any illegal or unauthorized purpose.
            </li>
            <li>
              Abuse, harass, threaten, intimidate, or impersonate other users.
            </li>
            <li>
              Send unsolicited communications, spam, or promotional content.
            </li>
            <li>
              Scrape, extract, or reproduce any part of the Application without
              our prior written consent.
            </li>
            <li>
              Interfere with or disrupt the operation of the Application,
              servers, or networks connected to the Application.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the
              Application, other user accounts, or computer systems.
            </li>
            <li>
              Upload or transmit viruses, malware, or any other harmful code.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            5. User Content & License
          </h2>
          <p className="text-foreground mb-4">
            Zen Berry allows you to create, submit, and store content including
            tasks, notes, pins, timer presets, and reviews (&quot;User
            Content&quot;).
          </p>
          <p className="text-foreground mb-4">
            <strong className="text-strawberry">Ownership:</strong> You retain
            all ownership rights to your User Content. We do not claim ownership
            over your tasks, notes, pins, or timer presets.
          </p>
          <p className="text-foreground mb-4">
            <strong className="text-strawberry">Reviews:</strong> By submitting
            a review, you grant us a non-exclusive, worldwide, royalty-free
            license to display, reproduce, and distribute your review on the
            Zen Berry website and related marketing materials. This license
            survives termination of your account for reviews that have been
            publicly displayed.
          </p>
          <p className="text-foreground">
            <strong className="text-strawberry">Feedback:</strong> If you
            provide us with suggestions, ideas, or feedback about the
            Application, you grant us a perpetual, irrevocable, royalty-free
            license to use and incorporate that feedback for product improvement
            purposes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            6. AI Features
          </h2>
          <p className="text-foreground mb-4">
            Zen Berry offers AI-powered productivity insights through the Google
            Gemini API (&quot;AI Features&quot;). By using AI Features, you
            acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              Only anonymized, non-personally-identifiable productivity
              statistics are sent to Gemini AI for processing.
            </li>
            <li>
              No personal data such as your name, email address, task content,
              or other identifiable information is transmitted to the AI.
            </li>
            <li>
              AI-generated insights are provided for informational purposes only
              and should not be relied upon as professional or medical advice.
            </li>
            <li>
              You may opt out of AI Features at any time by simply not using
              them. No AI processing occurs without your active use of the
              feature.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            7. Intellectual Property
          </h2>
          <p className="text-foreground mb-4">
            The Zen Berry brand, name, logo, design, user interface, codebase,
            and all related intellectual property are owned by Norman Bautista.
            These materials are protected by copyright, trademark, and other
            intellectual property laws of the Republic of the Philippines and
            international treaties.
          </p>
          <p className="text-foreground">
            You may not reproduce, distribute, modify, create derivative works
            of, publicly display, or otherwise exploit any part of the
            Application&apos;s intellectual property without our prior written
            consent.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            8. Third-Party Services
          </h2>
          <p className="text-foreground mb-4">
            Zen Berry integrates with the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>
              <strong className="text-strawberry">Supabase:</strong> Provides
              database hosting, authentication, and file storage. Use of
              Supabase is governed by Supabase&apos;s own terms of service and
              privacy policy.
            </li>
            <li>
              <strong className="text-strawberry">Google (OAuth & Gemini AI):</strong>{" "}
              Provides authentication via Google OAuth and AI processing via the
              Gemini API. Use of Google services is governed by Google&apos;s
              terms of service and privacy policy.
            </li>
          </ul>
          <p className="text-foreground mt-4">
            We are not responsible for the practices of these third-party
            services. We encourage you to review their respective terms and
            privacy policies before using their services in connection with Zen
            Berry.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            9. Disclaimer of Warranties
          </h2>
          <p className="text-foreground">
            Zen Berry is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis, without any warranties of any kind, either
            express or implied, including but not limited to implied warranties
            of merchantability, fitness for a particular purpose, or
            non-infringement. We do not warrant that the Application will be
            uninterrupted, error-free, secure, or free from viruses or other
            harmful components.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            10. Limitation of Liability
          </h2>
          <p className="text-foreground mb-4">
            To the fullest extent permitted by applicable law, Norman Bautista
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or relating to
            your use of or inability to use Zen Berry, including but not limited
            to loss of data, loss of productivity, or loss of profits.
          </p>
          <p className="text-foreground">
            Nothing in these Terms affects your statutory rights under the
            Philippine Data Privacy Act (RA 10173) or any other applicable law
            that cannot be limited or excluded by agreement.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            11. Indemnification
          </h2>
          <p className="text-foreground">
            You agree to indemnify, defend, and hold harmless Norman Bautista
            from and against any and all claims, liabilities, damages, losses,
            costs, and expenses arising out of or in connection with your
            violation of these Terms, your misuse of the Application, or your
            violation of any applicable law or the rights of any third party.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            12. Termination
          </h2>
          <p className="text-foreground mb-4">
            We reserve the right to suspend or terminate your access to Zen
            Berry at any time, without prior notice or liability, if you violate
            any provision of these Terms.
          </p>
          <p className="text-foreground">
            Upon termination, your right to use the Application will immediately
            cease. Sections 5 (User Content & License), 7 (Intellectual
            Property), 9 (Disclaimer of Warranties), 10 (Limitation of
            Liability), 11 (Indemnification), and 13 (Governing Law & Dispute
            Resolution) shall survive termination.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            13. Governing Law & Dispute Resolution
          </h2>
          <p className="text-foreground mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of the Republic of the Philippines, without regard to its
            conflict of law provisions.
          </p>
          <p className="text-foreground">
            Any dispute arising out of or relating to these Terms or your use of
            Zen Berry shall be exclusively resolved by the courts of the
            Republic of the Philippines. The parties agree to submit to the
            personal jurisdiction of the Regional Trial Court of Antipolo,
            Rizal, Philippines.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            14. Changes to Terms
          </h2>
          <p className="text-foreground mb-4">
            We reserve the right to modify or update these Terms at any time.
            Changes will be posted on this page with an updated &quot;Last
            updated&quot; date. Material changes may be communicated via email
            or in-app notification.
          </p>
          <p className="text-foreground">
            Your continued use of Zen Berry after any changes to these Terms
            constitutes your acceptance of the new Terms. If you do not agree to
            the updated Terms, you must stop using the Application.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-matcha mb-4">
            15. Contact
          </h2>
          <p className="text-foreground mb-4">
            If you have any questions about these Terms, please contact us:
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
      </div>
      <Footer />
    </div>
  )
}
