'use client'

import { motion } from 'framer-motion'

const SHOPS = [
  { name: 'Amazon JP', logo: 'AMZ' },
  { name: 'Mercari', logo: 'MCR' },
  { name: 'Rakuten', logo: 'RKT' },
  { name: 'Uniqlo JP', logo: 'UNI' },
  { name: 'Bandai', logo: 'BND' },
  { name: 'Zozotown', logo: 'ZZT' },
]

export default function SupportedShops() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">Kami Melayani Pembelian Dari</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {SHOPS.map((shop, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-black/5 flex items-center justify-center mb-3">
                <span className="sf-display-heavy text-gray-900 text-lg">{shop.logo}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{shop.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
