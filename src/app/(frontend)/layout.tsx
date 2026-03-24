import { Oswald, Inter } from 'next/font/google'
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
