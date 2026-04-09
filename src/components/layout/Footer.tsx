import { getLocale } from 'next-intl/server'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'

function getStringValue(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = '',
): string {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function getLocalizedValue(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
  locale: string,
  fallback: string,
): string {
  const suffix = locale === 'ko' ? 'ko' : 'en'

  for (const key of keys) {
    const localizedValue = source?.[`${key}_${suffix}`]
    if (typeof localizedValue === 'string' && localizedValue.trim()) {
      return localizedValue.trim()
    }

    const plainValue = source?.[key]
    if (typeof plainValue === 'string' && plainValue.trim()) {
      return plainValue.trim()
    }
  }

  return fallback
}

export default async function Footer() {
  const locale = await getLocale()
  const year = new Date().getFullYear()

  let siteName = 'Garlicton Recording Studio'
  let phone = '0507-1313-6843'
  let email = ''
  let instagramUrl = 'https://www.instagram.com/garlicton_studio'
  let kakaoChannelUrl = ''
  let copyrightKo = `© ${year} Garlicton Recording Studio. All rights reserved.`
  let copyrightEn = `© ${year} Garlicton Recording Studio. All rights reserved.`
  let location = locale === 'ko' ? '대한민국' : 'South Korea'
  let footerDescription = ''
  let contactTitle = locale === 'ko' ? 'Contact' : 'Contact'
  let phoneLabel = locale === 'ko' ? 'Phone' : 'Phone'
  let emailLabel = 'Email'
  let addressLabel = locale === 'ko' ? 'Address' : 'Address'
  let instagramLabel = 'Instagram'
  let kakaoChannelLabel = locale === 'ko' ? '카카오 채널' : 'Kakao Channel'
  let emailDisplay = ''
  let showEmail = true
  let showInstagram = true
  let showKakaoChannel = false

  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 }) as Record<string, any>
    siteName = getStringValue(settings.header, ['siteName'], siteName)
    phone = getStringValue(settings.contact, ['phone', 'footerPhone'], phone)
    email = getStringValue(settings.contact, ['email', 'footerEmail'], email)
    emailDisplay = getStringValue(settings.contact, ['emailDisplay'], email)
    instagramUrl = getStringValue(settings.contact, ['instagramUrl', 'footerInstagramUrl'], instagramUrl)
    kakaoChannelUrl = getStringValue(settings.contact, ['kakaoChannelUrl'], kakaoChannelUrl)
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
    location = getLocalizedValue(settings.footer, ['location'], locale, location)
    footerDescription = getLocalizedValue(settings.footer, ['description', 'subtitle'], locale, footerDescription)
    contactTitle = getLocalizedValue(settings.footer, ['contactTitle'], locale, contactTitle)
    phoneLabel = getLocalizedValue(settings.footer, ['phoneLabel'], locale, phoneLabel)
    emailLabel = getLocalizedValue(settings.footer, ['emailLabel'], locale, emailLabel)
    addressLabel = getLocalizedValue(settings.footer, ['addressLabel'], locale, addressLabel)
    instagramLabel = getLocalizedValue(settings.footer, ['instagramLabel'], locale, instagramLabel)
    kakaoChannelLabel = getLocalizedValue(settings.footer, ['kakaoChannelLabel'], locale, kakaoChannelLabel)
    showEmail = typeof settings.footer?.showEmail === 'boolean' ? settings.footer.showEmail : showEmail
    showInstagram = typeof settings.footer?.showInstagram === 'boolean' ? settings.footer.showInstagram : showInstagram
    showKakaoChannel = typeof settings.footer?.showKakaoChannel === 'boolean' ? settings.footer.showKakaoChannel : showKakaoChannel
    if (!location) {
      location = getLocalizedValue(settings.contact, ['address'], locale, location)
    }
  } catch {
    // fall through to defaults
  }

  const copyright = locale === 'ko' ? copyrightKo : copyrightEn
  const phoneHref = `tel:${phone.replace(/-/g, '')}`
  const instagramHandle = instagramUrl.replace(/\/$/, '').split('/').pop() ?? 'garlicton_studio'

  return (
    <footer className="bg-[#080808] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 text-center md:text-left md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="flex flex-col gap-4">
          <span className="font-[family-name:var(--font-inter)] font-semibold text-[13px] tracking-[0.2em] uppercase text-[#FFFFFFDD]">
            {siteName}
          </span>
          <div className="w-12 h-px bg-white/10 mx-auto md:mx-0" />
          {footerDescription && (
            <p className="max-w-xl text-[13px] leading-[1.8] text-[#CCCCCC]">
              {footerDescription}
            </p>
          )}
          <p className="text-[12px] text-[#CCCCCC] tracking-wider">
            {copyright}
          </p>
        </div>

        <div className="flex flex-col gap-3 items-center md:items-end">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#CCCCCC]">
            {contactTitle}
          </p>
          <div className="flex flex-col gap-2 text-[13px] text-[#F0F0F0]">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 hover:text-[#F0F0F0] text-[#CCCCCC] transition-colors"
            >
              <Phone size={14} />
              <span>{phoneLabel}: {phone}</span>
            </a>
            {showEmail && email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 hover:text-[#F0F0F0] text-[#CCCCCC] transition-colors"
              >
                <Mail size={14} />
                <span>{emailLabel}: {emailDisplay || email}</span>
              </a>
            )}
            {location && (
              <p className="inline-flex items-center gap-2 text-[#CCCCCC]">
                <MapPin size={14} />
                <span>{addressLabel}: {location}</span>
              </p>
            )}
            {showInstagram && instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#CCCCCC] hover:text-[#F0F0F0] transition-colors"
                aria-label={instagramLabel}
              >
                <Instagram size={16} />
                <span>{instagramLabel}: @{instagramHandle}</span>
              </a>
            )}
            {showKakaoChannel && kakaoChannelUrl && (
              <a
                href={kakaoChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#CCCCCC] hover:text-[#F0F0F0] transition-colors"
              >
                <span>{kakaoChannelLabel}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
