import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import SmartCalculator from '@/components/SmartCalculator'
import PublicTracking from '@/components/PublicTracking'
import HowItWorks from '@/components/HowItWorks'
import CategorySection from '@/components/CategorySection'
import FeaturesSection from '@/components/FeaturesSection'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
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
