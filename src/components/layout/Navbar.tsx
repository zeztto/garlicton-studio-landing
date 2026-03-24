'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Menu } from 'lucide-react'
import LanguageToggle from '@/components/ui/LanguageToggle'
import MobileMenu from '@/components/ui/MobileMenu'

export default function Navbar() {
  const t = useTranslations('nav')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#about', label: t('about') },
    { href: '#services', label: t('services') },
    { href: '#portfolio', label: t('portfolio') },
    { href: '#studio', label: t('studio') },
    { href: '#contact', label: t('contact') },
  ]

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo / Studio Name */}
          <a
            href="#"
            className="font-[family-name:var(--font-inter)] font-semibold text-[14px] tracking-[0.15em] uppercase text-[#F0F0F0] hover:text-white transition-colors"
            style={{ fontVariant: 'small-caps' }}
          >
            Garlicton Recording Studio
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-[family-name:var(--font-inter)] text-[13px] tracking-wider text-[#FFFFFFB3] hover:text-[#F0F0F0] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <LanguageToggle />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#FFFFFFB3] hover:text-[#F0F0F0] transition-colors"
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
