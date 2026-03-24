import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { About } from '@/components/sections/About'
import { Portfolio } from '@/components/sections/Portfolio'
import { StudioGallery } from '@/components/sections/StudioGallery'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <>
      <Hero locale={locale} />
      <Services locale={locale} />
      <About locale={locale} />
      <Portfolio locale={locale} />
      <StudioGallery locale={locale} />
    </>
  )
}

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}
