import { useTranslations } from 'next-intl'
import { Instagram } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#080808] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        {/* Studio name */}
        <span className="font-[family-name:var(--font-inter)] font-semibold text-[13px] tracking-[0.2em] uppercase text-[#FFFFFFB3]">
          Garlicton Recording Studio
        </span>

        {/* Divider */}
        <div className="w-12 h-px bg-white/10" />

        {/* Copyright */}
        <p className="text-[12px] text-[#AAAAAA] tracking-wider">
          {t('copyright', { year })}
        </p>

        {/* Location */}
        <p className="text-[12px] text-[#AAAAAA] tracking-widest uppercase">
          {t('location')}
        </p>

        {/* Social + Phone */}
        <div className="flex items-center gap-6 mt-2">
          <a
            href="https://www.instagram.com/garlicton_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#AAAAAA] hover:text-[#F0F0F0] transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={16} />
          </a>
          <a
            href="tel:050713136843"
            className="text-[12px] text-[#AAAAAA] hover:text-[#F0F0F0] transition-colors tracking-wider"
          >
            0507-1313-6843
          </a>
        </div>
      </div>
    </footer>
  )
}
