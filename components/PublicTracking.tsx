'use client'

import { useState } from 'react'
import { Search, MapPin, Package, Clock, CheckCircle2, Plane, Warehouse, ShieldAlert, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_TRACKING = {
  'JA-99214': {
    status: 'Dalam Pengiriman',
    lastUpdate: 'Barang sedang menuju Gudang Jakarta.',
    steps: [
      { title: 'Pesanan Diterima', time: '20 May, 09:00', done: true, icon: Package },
      { title: 'Gudang Tokyo', time: '21 May, 14:20', done: true, icon: Warehouse },
      { title: 'Bea Cukai (Customs)', time: '23 May, 10:15', done: true, icon: ShieldAlert },
      { title: 'Pengiriman Udara', time: '24 May, 08:00', current: true, icon: Plane },
      { title: 'Sampai Tujuan', time: 'Estimasi 26 May', done: false, icon: CheckCircle2 },
    ]
  }
}

export default function PublicTracking() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResult(MOCK_TRACKING[query as keyof typeof MOCK_TRACKING] || 'not_found')
      setLoading(false)
    }, 800)
  }

  return (
    <section id="tracking" className="bg-white py-24 lg:py-32 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4 sf-display-heavy">Lacak Pesanan Jastip</h2>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Masukkan nomor resi JA Anda untuk melihat posisi barang secara real-time.
                </p>
            </div>

            <div className="bg-[#F5F5F7] rounded-[40px] p-8 md:p-12 apple-shadow border border-black/[0.03]">
                <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-10">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value.toUpperCase())}
                        placeholder="Contoh: JA-99214"
                        className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 text-lg font-bold placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-apple-blue/10 transition-all apple-shadow"
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-[#1D1D1F] text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                        Lacak
                    </button>
                </form>

                <AnimatePresence mode="wait">
                    {result === 'not_found' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center py-10 bg-red-50 rounded-[32px] border border-red-100"
                        >
                            <p className="text-red-600 font-bold">Nomor resi tidak ditemukan. Pastikan ID sudah benar.</p>
                        </motion.div>
                    )}

                    {result && result !== 'not_found' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 animate-fade-in"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-8">
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Status Terkini</p>
                                    <h3 className="text-2xl sf-display-heavy text-[#1D1D1F]">{result.status}</h3>
                                </div>
                                <div className="bg-apple-blue/10 text-apple-blue px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <MapPin size={16} /> {result.lastUpdate}
                                </div>
                            </div>

                            {/* Apple Style Timeline */}
                            <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
                                {result.steps.map((step: any, i: number) => (
                                    <div key={i} className="relative group">
                                        <div className={`absolute -left-10 w-6 h-6 rounded-full border-4 border-[#F5F5F7] z-10 flex items-center justify-center transition-colors duration-500 ${step.done ? 'bg-green-500' : step.current ? 'bg-apple-blue animate-pulse' : 'bg-gray-300'}`}>
                                            {step.done && <CheckCircle2 size={10} className="text-white" />}
                                        </div>
                                        <div className={`flex items-start gap-6 transition-opacity ${!step.done && !step.current ? 'opacity-40' : 'opacity-100'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 apple-shadow border border-black/5 ${step.current ? 'bg-apple-blue text-white' : 'bg-white text-gray-500'}`}>
                                                <step.icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1D1D1F]">{step.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{step.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 text-center">
                                <p className="text-xs text-gray-400 mb-4">Butuh bantuan pengiriman?</p>
                                <button className="inline-flex items-center gap-2 text-apple-blue font-bold hover:underline">
                                    Hubungi Kurir Jastip <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </section>
  )
}
