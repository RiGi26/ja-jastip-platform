import { RATES } from '@/constants/rates'
import { formatRupiah } from '@/lib/calculator'

const CATEGORY_META = [
  { icon: '👗', examples: 'Uniqlo, GU, Muji' },
  { icon: '💄', examples: 'Shiseido, SK-II, DHC' },
  { icon: '🎮', examples: 'Nintendo, Sony, Casio' },
  { icon: '👜', examples: 'LV, Coach, Gucci' },
  { icon: '🍜', examples: 'Kit Kat JP, Pocky, dll' },
  { icon: '🗿', examples: 'Gundam, Nendoroid, dll' },
]

export default function CategorySection() {
  return (
    <section id="kategori" className="bg-[#f3f7fc] py-20 lg:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Kategori Barang</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
            Barang apa saja yang kami handle?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Dari fashion hingga luxury brand — semua kategori tersedia dengan tarif transparan.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {RATES.CATEGORIES.map((cat, i) => {
            const meta = CATEGORY_META[i]
            return (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="text-3xl mb-3">{meta.icon}</div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{cat.label}</h3>
                <p className="text-xs text-gray-400 mb-3">{meta.examples}</p>
                {cat.surcharge > 0 ? (
                  <span className="inline-flex text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full">
                    +{formatRupiah(cat.surcharge)} surcharge
                  </span>
                ) : (
                  <span className="inline-flex text-[10px] font-black bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full">
                    Tanpa surcharge
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Kategori lain atau barang spesial?{' '}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '6281296917963'}?text=${encodeURIComponent('Halo JapanArena Jastip, saya ingin tanya soal barang spesial 🇯🇵')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-bold"
          >
            Tanya langsung via WA →
          </a>
        </p>
      </div>
    </section>
  )
}
