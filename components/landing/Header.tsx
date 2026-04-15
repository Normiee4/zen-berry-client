"use client"

import { Button } from "@/components/ui/button"
import { useResponsive } from "@/hooks/useResponsive"
import { Leaf, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about-zenberry", label: "About" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isTabletOrUp } = useResponsive()
  const showMobileMenu = isMenuOpen && !isTabletOrUp

  return (
    <header className="sticky top-0 z-50 w-full border-b border-strawberry-light/50 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-matcha">
            <Leaf className="size-4 text-white" />
          </div>
          <span className="text-lg text-matcha font-semibold ">Zen Berry</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-matcha"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-foreground hover:bg-strawberry-light hover:text-foreground">
            <Link href="/auth/login">
              Log in
            </Link>  
          </Button>
          <Button className="bg-matcha text-white hover:bg-matcha/90">
            <Link href='/auth/signup'>
              Get Started
            </Link> 
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="border-t border-strawberry-light/50 bg-cream px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-matcha"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-strawberry-light" />
            <Button variant="ghost" className="text-foreground hover:bg-strawberry-light hover:text-foreground">
              <Link href="/auth/login">
                Log in
              </Link>  
            </Button>
            <Button className="bg-matcha text-white hover:bg-matcha/90">
              <Link href='/auth/sign-up'>
                Get Started
              </Link> 
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
