'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n/config'

export default function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleToggle = (targetLocale: string) => {
    if (targetLocale === locale) return

    // Replace the current locale prefix with the new one
    const segments = pathname.split('/')
    // segments[0] is '', segments[1] is locale
    segments[1] = targetLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 text-xs tracking-widest">
      {locales.map((l, index) => (
        <span key={l} className="flex items-center">
          <button
            onClick={() => handleToggle(l)}
            className={`transition-colors duration-200 ${
              locale === l
                ? 'text-[#F0F0F0]'
                : 'text-[#FFFFFF4D] hover:text-[#FFFFFFB3]'
            }`}
          >
            {l.toUpperCase()}
          </button>
          {index < locales.length - 1 && (
            <span className="mx-1 text-[#FFFFFF4D]">|</span>
          )}
        </span>
      ))}
    </div>
  )
}
