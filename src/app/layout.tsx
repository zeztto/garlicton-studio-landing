import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Garlicton Studio',
  description: 'Metal music production studio',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children as React.JSX.Element
}
