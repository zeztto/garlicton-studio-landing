'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import LanguageToggle from './LanguageToggle'
import type { NavLinkItem } from '@/lib/site-settings'

type Props = {
  isOpen: boolean
  onClose: () => void
  links: NavLinkItem[]
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

export default function MobileMenu({ isOpen, onClose, links }: Props) {
  const pathname = usePathname()

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

  const handleLinkClick = (link: NavLinkItem) => {
    onClose()

    if (link.kind !== 'anchor') {
      return
    }

    const target = getAnchorTarget(link.href)

    if (!target || normalizePathname(pathname) !== target.pathname) {
      return
    }

    // Smooth scroll after menu closes
    setTimeout(() => {
      const el = document.querySelector(target.selector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', link.href)
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
          className="text-[#FFFFFFDD] hover:text-[#F0F0F0] transition-colors"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => handleLinkClick(link)}
            className="text-[#FFFFFFDD] hover:text-[#F0F0F0] transition-colors font-[family-name:var(--font-inter)] text-2xl tracking-widest uppercase"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Language toggle */}
      <div className="flex justify-center pb-12">
        <LanguageToggle />
      </div>
    </div>
  )
}
