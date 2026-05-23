'use client'

import { motion } from 'framer-motion'

export default function MarketTicker() {
  const items = [
    { label: 'KURS JPY/IDR', value: 'Rp 105.42' },
    { label: 'TOKYO WH STATUS', value: '🟢 ACTIVE' },
    { label: 'JAKARTA WH STATUS', value: '🟢 ACTIVE' },
    { label: 'AIR CARGO SLOT', value: 'AVAILABLE' },
    { label: 'SEA CARGO SLOT', value: 'AVAILABLE' },
    { label: 'EST. DELIVERY', value: '7-12 DAYS' },
  ]

  return (
    <div className="bg-[#1D1D1F] overflow-hidden py-2 border-b border-white/5">
      <motion.div 
        className="flex whitespace-nowrap gap-12"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
            <span className="text-[11px] font-black text-apple-blue">{item.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
