'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import LanguageToggle from './LanguageToggle'

type NavLink = {
  href: string
  label: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
}

export default function MobileMenu({ isOpen, onClose, links }: Props) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    // Smooth scroll after menu closes
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-[#0A0A0A] transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Close button */}
      <div className="flex justify-end p-6">
        <button
          onClick={onClose}
          className="text-[#FFFFFFB3] hover:text-[#F0F0F0] transition-colors"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => handleLinkClick(link.href)}
            className="text-[#FFFFFFB3] hover:text-[#F0F0F0] transition-colors font-[family-name:var(--font-inter)] text-2xl tracking-widest uppercase"
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Language toggle */}
      <div className="flex justify-center pb-12">
        <LanguageToggle />
      </div>
    </div>
  )
}
