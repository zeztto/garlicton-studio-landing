'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import LanguageToggle from '@/components/ui/LanguageToggle'
import MobileMenu from '@/components/ui/MobileMenu'
import type { NavLinkItem } from '@/lib/site-settings'

interface NavbarProps {
  siteName?: string
  homeHref?: string
  navLinks?: NavLinkItem[]
}

function normalizePathname(pathname: string | null): string {
  if (!pathname || pathname === '/') {
    return pathname ?? '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function getAnchorTarget(href: string): { pathname: string; selector: string } | null {
  const hashIndex = href.indexOf('#')

  if (hashIndex < 0) {
    return null
  }

  const rawPathname = href.slice(0, hashIndex) || '/'
  const rawHash = href.slice(hashIndex + 1)

  if (!rawHash) {
    return null
  }

  return {
    pathname: normalizePathname(rawPathname),
    selector: `#${rawHash}`,
  }
}

export default function Navbar({
  siteName = 'Garlicton Recording Studio',
  homeHref = '/',
  navLinks = [],
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLinkItem,
  ) => {
    if (link.kind !== 'anchor') {
      return
    }

    const target = getAnchorTarget(link.href)

    if (!target) {
      return
    }

    if (normalizePathname(pathname) === target.pathname) {
      e.preventDefault()
      const el = document.querySelector(target.selector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', link.href)
      }
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo / Studio Name */}
          <Link
            href={homeHref}
            className="font-[family-name:var(--font-inter)] font-semibold text-[14px] tracking-[0.15em] uppercase text-[#F0F0F0] hover:text-white transition-colors"
            style={{ fontVariant: 'small-caps' }}
          >
            {siteName}
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="font-[family-name:var(--font-inter)] text-[13px] tracking-wider text-[#FFFFFFDD] hover:text-[#F0F0F0] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#FFFFFFDD] hover:text-[#F0F0F0] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  )
}
