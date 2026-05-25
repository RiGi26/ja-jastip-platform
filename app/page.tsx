'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import MarketTicker from '@/components/MarketTicker'
import HeroSection from '@/components/HeroSection'
import SmartCalculator from '@/components/SmartCalculator'
import SupportedShops from '@/components/SupportedShops'
import PublicTracking from '@/components/PublicTracking'
import HowItWorks from '@/components/HowItWorks'
import CategorySection from '@/components/CategorySection'
import FeaturesSection from '@/components/FeaturesSection'
import Footer from '@/components/Footer'
import { clearSession } from '@/lib/auth'

export default function HomePage() {
  // Security Policy: Paksa hapus sesi admin saat user berada di Landing Page
  // Agar setiap masuk ke Portal Admin harus memasukkan kredensial baru
  useEffect(() => {
    // Hapus sesi di LocalStorage
    clearSession()
    // Hapus cookie auth
    document.cookie = 'jastip_auth=; path=/; max-age=0'
  }, [])

  return (
    <>
      <MarketTicker />
      <Navbar />
      <main>
        <HeroSection />
        <SupportedShops />
        <SmartCalculator />
        <PublicTracking />
        <HowItWorks />
        <CategorySection />
        <FeaturesSection />
      </main>
      <Footer />
    </>
  )
}
