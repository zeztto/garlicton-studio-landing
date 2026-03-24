import type { Metadata } from 'next'
import { Oswald, Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

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

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Garlicton Studio',
  description: 'Metal music production studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${oswald.variable} ${inter.variable} ${notoSansKR.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
