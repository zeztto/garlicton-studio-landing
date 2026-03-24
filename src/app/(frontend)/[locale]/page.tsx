import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { About } from '@/components/sections/About'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <>
      <Hero locale={locale} />
      <Services locale={locale} />
      <About locale={locale} />
    </>
  )
}

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}
