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

export default function HomePage() {
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
