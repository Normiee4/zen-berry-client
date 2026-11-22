"use client"


import Link from "next/link"
import { Leaf, Heart, Mail } from "lucide-react"
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import { CookieSettingsButton } from "@/components/cookies/cookie-settings-button"

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About", href: "/#about-zenberry" },
    { label: "Reviews", href: "/reviews" },
  ],
  resources: [
    { label: "Feedback", href: "/feedback" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
}

const socialLinks = [
  { icon: Mail, href: "mailto:dpo@zenberry.app", label: "Email", external: false },
  { icon: GitHubIcon, href: "https://github.com/Norman-Bautista?tab=repositories", label: "GitHub", external: true },
  { icon: LinkedInIcon, href: "https://www.linkedin.com/in/norman-enricko-bautista-1769572a8/", label: "LinkedIn", external: true },
]

export function Footer() {
  return (
    <footer className="border-t border-matcha-light/50 bg-matcha-light/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-matcha">
                <Leaf className="size-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-matcha-dark">Zen Berry</span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-matcha-dark/75">
              A mindful productivity app that helps you focus without the burnout. 
              Grow your flow, one gentle session at a time.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className="flex size-11 items-center justify-center rounded-full bg-strawberry-light/50 text-muted-foreground transition-colors hover:bg-matcha hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Product</h2>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Resources</h2>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Legal</h2>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton
                  label="Cookie Settings"
                  className="inline-block cursor-pointer py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
                />
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-strawberry-light/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zen Berry. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="size-4 fill-strawberry text-strawberry" /> and matcha by Norman Bautista
          </p>
        </div>
      </div>
    </footer>
  )
}
