const WA_NUMBER   = process.env.NEXT_PUBLIC_WA_NUMBER   ?? '6281296917963'
const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://ja-landingpage-platform.vercel.app'

const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo JapanArena Jastip, saya ingin tanya soal jastip dari Jepang 🇯🇵')}`

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white/40 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          {/* Brand */}
          <div>
            <p className="font-black text-white text-base mb-2">
              JapanArena <span className="text-red-500">Jastip</span>
            </p>
            <p className="text-sm leading-relaxed max-w-xs">
              Sistem jastip profesional dari Jepang ke Indonesia. Express 5–9 hari, success rate 99.4%.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-white/70 font-bold text-sm mb-4">Navigasi</p>
            <div className="space-y-2.5 text-sm">
              <a href="#"           className="block hover:text-white/70 transition-colors">Home</a>
              <a href="#calculator" className="block hover:text-white/70 transition-colors">Smart Calculator</a>
              <a href="#cara-order" className="block hover:text-white/70 transition-colors">Cara Order</a>
              <a href="#kategori"   className="block hover:text-white/70 transition-colors">Kategori Barang</a>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p className="text-white/70 font-bold text-sm mb-4">Kontak</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-black rounded-xl transition-all mb-3"
            >
              💬 Chat via WhatsApp
            </a>
            <a
              href={LANDING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs hover:text-white/60 transition-colors"
            >
              japanarenacorp.com →
            </a>
          </div>

        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 JapanArena Jastip. Bagian dari Japan Arena Corp.</p>
          <p>Jepang → Indonesia, langsung ke tanganmu 🇯🇵</p>
        </div>
      </div>
    </footer>
  )
}
