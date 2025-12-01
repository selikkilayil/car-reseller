import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

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
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}
