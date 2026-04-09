import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

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

  let siteName = 'Garlicton Recording Studio'
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    siteName = settings.header?.siteName ?? siteName
  } catch {
    // fall through to default
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar siteName={siteName} />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
