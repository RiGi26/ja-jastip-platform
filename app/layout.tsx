import type { Metadata } from 'next'
import './globals.css'
import BrandStyle from '@/components/BrandStyle'

export const metadata: Metadata = {
  title: 'JapanArena Jastip — Jepang ke Indonesia',
  description:
    'Sistem jastip profesional dari Jepang ke Indonesia. Smart Calculator otomatis, support luxury brand, figure anime, skincare, fashion Uniqlo & GU.',
  openGraph: {
    title: 'JapanArena Jastip Jepang → Indonesia',
    description: 'Hitung biaya jastip otomatis. Express 5–9 hari. Success rate 99.4%.',
    url: 'https://jastip.japanarenacorp.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#f3f7fc] text-[#0f172a] overflow-x-hidden">
        <BrandStyle />
        {children}
      </body>
    </html>
  )
}
