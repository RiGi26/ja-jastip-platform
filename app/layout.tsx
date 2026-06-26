import type { Metadata } from 'next'
import './globals.css'
import BrandStyle from '@/components/BrandStyle'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Webzoka Jastip — Jepang ke Indonesia',
  description:
    'Sistem jastip profesional dari Jepang ke Indonesia. Smart Calculator otomatis, support luxury brand, figure anime, skincare, fashion Uniqlo & GU.',
  openGraph: {
    title: 'Webzoka Jastip Jepang → Indonesia',
    description: 'Hitung biaya jastip otomatis. Express 5–9 hari. Success rate 99.4%.',
    url: 'https://jastip.webzoka.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#f3f7fc] text-[#0f172a] overflow-x-hidden font-jakarta">
        <BrandStyle />
        {children}
      </body>
    </html>
  )
}
