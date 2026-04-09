import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import './frontend.css'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '갈릭톤 스튜디오 | 최고의 테이크가 최고의 결과를 만든다',
  description: 'Metal music production studio',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${oswald.variable} ${inter.variable}`} style={{ scrollBehavior: 'smooth' }}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
