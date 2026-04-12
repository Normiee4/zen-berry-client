"use client"


import Link from "next/link"
import { Leaf, Heart, Mail } from "lucide-react"
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Guides", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
}

const socialLinks = [
  { icon: Mail, href: "#  ", label: "Email"},
  { icon: GitHubIcon, href: "https://github.com/Norman-Bautista?tab=repositories", label: "GitHub" },
  { icon: LinkedInIcon, href: "https://www.linkedin.com/in/norman-enricko-bautista-1769572a8/", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="border-t border-strawberry-light/50 bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-matcha">
                <Leaf className="size-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">Zen Berry</span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A mindful productivity app that helps you focus without the burnout. 
              Grow your flow, one gentle session at a time. 🍓🍵
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-10 items-center justify-center rounded-full bg-strawberry-light/50 text-muted-foreground transition-colors hover:bg-matcha hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-matcha"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-strawberry-light/50 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zen Berry. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="size-4 fill-strawberry text-strawberry" /> and matcha
          </p>
        </div>
      </div>
    </footer>
  )
}
