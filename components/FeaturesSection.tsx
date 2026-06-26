const FEATURES = [
  {
    icon: '🇯🇵',
    title: 'Spesialis Jepang → Indonesia',
    desc: 'Fokus khusus rute Jepang–Indonesia. Pengalaman bertahun-tahun menangani barang dari toko fisik dan e-commerce Jepang seperti Uniqlo, Tokopedia JP, hingga Yahoo Auctions.',
  },
  {
    icon: '📦',
    title: 'Smart Volume Detection',
    desc: 'Sistem hitung volumetric weight otomatis (P×L×T ÷ 5.000). Biaya pengiriman lebih akurat, tidak ada kejutan tagihan di akhir. Transparansi penuh sejak awal.',
  },
  {
    icon: '⚡',
    title: 'Real-time Calculator',
    desc: 'Total biaya update langsung saat kamu input data barang. Tidak perlu tunggu balasan WA hanya untuk tahu estimasi harga. Hitung sendiri kapan saja.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-white py-20 lg:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Keunggulan</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
            Kenapa Pilih Webzoka Jastip?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tiga alasan utama mengapa ratusan customer mempercayakan jastip mereka ke kami.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:border-blue-200 hover:bg-white transition-all duration-300"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-black text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
