import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  createNavLink,
  getLocalizedText,
  getPagesIndexNavLink,
  getPlainText,
  getSectionOrder,
  isSectionVisible,
  type HomeSectionKey,
  type NavLinkItem,
} from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const homeHref = `/${locale}`

  let siteName = 'Garlicton Recording Studio'
  let navLinks: NavLinkItem[] = []
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 }) as Record<string, any>
    siteName = getPlainText(settings.header, 'siteName', siteName)

    const navLabelMap: Record<Exclude<HomeSectionKey, 'hero'>, string> = {
      services: getLocalizedText(settings.navigation, 'servicesLabel', locale, locale === 'ko' ? '서비스' : 'Services'),
      about: getLocalizedText(settings.navigation, 'aboutLabel', locale, locale === 'ko' ? '소개' : 'About'),
      portfolio: getLocalizedText(settings.navigation, 'portfolioLabel', locale, locale === 'ko' ? '포트폴리오' : 'Portfolio'),
      studio: getLocalizedText(settings.navigation, 'studioLabel', locale, locale === 'ko' ? '스튜디오' : 'Studio'),
      contact: getLocalizedText(settings.navigation, 'contactLabel', locale, locale === 'ko' ? '연락처' : 'Contact'),
    }

    const sectionVisibility: Record<HomeSectionKey, boolean> = {
      hero: isSectionVisible(settings.hero),
      services: isSectionVisible(settings.servicesSection),
      about: isSectionVisible(settings.aboutSection),
      portfolio: isSectionVisible(settings.portfolioSection),
      studio: isSectionVisible(settings.studioSection),
      contact: isSectionVisible(settings.contactSection),
    }

    navLinks = getSectionOrder(settings.homepageLayout)
      .filter((section): section is Exclude<HomeSectionKey, 'hero'> => section !== 'hero')
      .filter((section) => sectionVisibility[section])
      .map((section) => createNavLink(`${homeHref}#${section}`, navLabelMap[section]))

    const pagesIndexLink = getPagesIndexNavLink(settings, locale)
    if (pagesIndexLink && !navLinks.some((link) => link.href === pagesIndexLink.href)) {
      navLinks = [...navLinks, pagesIndexLink]
    }
  } catch {
    // fall through to default
    navLinks = [
      createNavLink(`${homeHref}#about`, locale === 'ko' ? '소개' : 'About'),
      createNavLink(`${homeHref}#services`, locale === 'ko' ? '서비스' : 'Services'),
      createNavLink(`${homeHref}#portfolio`, locale === 'ko' ? '포트폴리오' : 'Portfolio'),
      createNavLink(`${homeHref}#studio`, locale === 'ko' ? '스튜디오' : 'Studio'),
      createNavLink(`${homeHref}#contact`, locale === 'ko' ? '연락처' : 'Contact'),
    ]
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar siteName={siteName} homeHref={homeHref} navLinks={navLinks} />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
