import { getLocale } from 'next-intl/server'
import { Instagram } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'

export default async function Footer() {
  const locale = await getLocale()
  const year = new Date().getFullYear()

  let siteName = 'Garlicton Recording Studio'
  let phone = '0507-1313-6843'
  let instagramUrl = 'https://www.instagram.com/garlicton_studio'
  let copyrightKo = `© ${year} Garlicton Recording Studio. All rights reserved.`
  let copyrightEn = `© ${year} Garlicton Recording Studio. All rights reserved.`
  let location = 'South Korea'

  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    siteName = settings.header?.siteName ?? siteName
    phone = settings.contact?.phone ?? phone
    instagramUrl = settings.contact?.instagramUrl ?? instagramUrl
    if (settings.footer?.copyright_ko) {
      copyrightKo = (settings.footer.copyright_ko as string).replace('{year}', String(year))
    } else {
      copyrightKo = `© ${year} Garlicton Recording Studio. All rights reserved.`
    }
    if (settings.footer?.copyright_en) {
      copyrightEn = (settings.footer.copyright_en as string).replace('{year}', String(year))
    } else {
      copyrightEn = `© ${year} Garlicton Recording Studio. All rights reserved.`
    }
    location = (settings.footer?.location as string | undefined) ?? location
  } catch {
    // fall through to defaults
  }

  const copyright = locale === 'ko' ? copyrightKo : copyrightEn
  const phoneHref = `tel:${phone.replace(/-/g, '')}`

  return (
    <footer className="bg-[#080808] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        {/* Studio name */}
        <span className="font-[family-name:var(--font-inter)] font-semibold text-[13px] tracking-[0.2em] uppercase text-[#FFFFFFDD]">
          {siteName}
        </span>

        {/* Divider */}
        <div className="w-12 h-px bg-white/10" />

        {/* Copyright */}
        <p className="text-[12px] text-[#CCCCCC] tracking-wider">
          {copyright}
        </p>

        {/* Location */}
        <p className="text-[12px] text-[#CCCCCC] tracking-widest uppercase">
          {location}
        </p>

        {/* Social + Phone */}
        <div className="flex items-center gap-6 mt-2">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#CCCCCC] hover:text-[#F0F0F0] transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={16} />
          </a>
          <a
            href={phoneHref}
            className="text-[12px] text-[#CCCCCC] hover:text-[#F0F0F0] transition-colors tracking-wider"
          >
            {phone}
          </a>
        </div>
      </div>
    </footer>
  )
}
