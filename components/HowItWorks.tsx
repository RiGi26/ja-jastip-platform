const STEPS = [
  {
    icon: '🛍️',
    title: 'Pilih Barang',
    desc: 'Temukan barang di toko Jepang — Uniqlo, GU, Muji, Amazon JP, dll. Screenshot atau kirim link produk ke kami.',
  },
  {
    icon: '🧮',
    title: 'Hitung Biaya',
    desc: 'Gunakan Smart Calculator di atas untuk estimasi biaya pengiriman. Input berat, dimensi, dan kategori barang.',
  },
  {
    icon: '💬',
    title: 'Konfirmasi via WA',
    desc: 'Chat dengan tim JapanArena untuk konfirmasi order, lakukan pembayaran, dan dapatkan update tracking realtime.',
  },
  {
    icon: '📦',
    title: 'Terima Paket',
    desc: 'Paket tiba dalam 5–9 hari ke seluruh Indonesia. Dikemas rapi dan aman, dengan garansi keamanan barang.',
  },
]

export default function HowItWorks() {
  return (
    <section id="cara-order" className="bg-white py-20 lg:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Cara Order</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
            4 Langkah Mudah
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Dari pilih barang hingga terima paket — semua mudah dan transparan.
          </p>
        </div>

        {/* Desktop: horizontal stepper */}
        <div className="hidden md:grid grid-cols-4 gap-6 relative">
          <div className="absolute top-10 left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
          {STEPS.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="relative inline-flex w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 items-center justify-center text-3xl mb-5 mx-auto shadow-sm">
                {step.icon}
                <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-black text-gray-900 text-base mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stepper */}
        <div className="md:hidden space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
