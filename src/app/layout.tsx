import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/ConditionalLayout'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Reseller System',
  description: 'Manage car purchases, repairs, and sales',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className={`${geist.className} antialiased`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
