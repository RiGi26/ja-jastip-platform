import { ArrowDown, MessageCircle, Check } from 'lucide-react'

const WA_NUMBER  = process.env.NEXT_PUBLIC_WA_NUMBER  ?? '6281296917963'
const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo JapanArena Jastip, saya ingin tanya soal jastip dari Jepang 🇯🇵')}`

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-16 px-4 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-4 py-2 rounded-full">
              🇯🇵 Spesialis Jastip Jepang → Indonesia
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Jastip Jepang →{' '}
              <span className="text-blue-400">Indonesia</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-1">
                dengan Smart Calculator
              </span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
              Fashion Uniqlo & GU, skincare Shiseido & SK-II, figure anime Gundam &
              Nendoroid, hingga luxury brand — semua kami handle. Express 5–9 hari
              ke seluruh Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all hover:scale-[1.02] text-base shadow-lg shadow-blue-900/50"
              >
                Hitung Biaya Sekarang <ArrowDown size={16} />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-all hover:scale-[1.02] text-base"
              >
                <MessageCircle size={16} /> Tanya via WA
              </a>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-green-400" /> 5–9 hari ke Indonesia
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-green-400" /> 99.4% success rate
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-green-400" /> Support luxury brand
              </span>
            </div>
          </div>

          {/* Right — Live Rate Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="animate-floating w-full max-w-sm">
              <div
                className="rounded-2xl p-6 text-white shadow-2xl border border-white/10"
                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
              >
                {/* Live indicator */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="relative w-2.5 h-2.5">
                      <div className="absolute inset-0 rounded-full bg-green-400" />
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
                    </div>
                    <span className="text-xs font-black text-green-400 tracking-widest uppercase">Live</span>
                  </div>
                  <span className="text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full">
                    ACTIVE
                  </span>
                </div>

                {/* Main price */}
                <p className="text-white/60 text-xs mb-1">Estimasi rata-rata jastip</p>
                <p className="text-4xl font-black text-white mb-1">Rp1.200.000</p>
                <p className="text-white/40 text-[11px] mb-5">Barang 3kg · Fashion Uniqlo · Regular Cargo</p>

                {/* Info boxes */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/10 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xl font-black text-white">5–9 Hari</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Estimasi tiba</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xl font-black text-white">99.4%</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Success rate</p>
                  </div>
                </div>

                {/* Progress bar */}
                <p className="text-[10px] text-white/40 mb-1.5 uppercase tracking-widest">Order success rate</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full animate-progress" />
                </div>

                <p className="text-[10px] text-white/30 mt-4 text-center">
                  Harga akhir dikonfirmasi via WhatsApp
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
