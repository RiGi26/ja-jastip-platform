'use client'

import { useState } from 'react'
import { MessageCircle, ShieldCheck, Download, ExternalLink, Info } from 'lucide-react'
import { RATES } from '@/constants/rates'
import { calculate, formatRupiah, type CalcInput } from '@/lib/calculator'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '6281296917963'

function InputField({
  label, value, onChange, min = 0.1, step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest sf-display">
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={e => {
          const v = step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value)
          onChange(isNaN(v) ? min : Math.max(min, v))
        }}
        className="w-full px-4 py-3 rounded-2xl border border-black/5 text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:bg-white bg-white transition-all"
      />
    </div>
  )
}

function SelectField<T extends string | number>({
  label, value, onChange, options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest sf-display">
        {label}
      </label>
      <select
        value={String(value)}
        onChange={e => {
          const raw = e.target.value
          onChange((typeof value === 'number' ? Number(raw) : raw) as T)
        }}
        className="w-full px-4 py-3 rounded-2xl border border-black/5 text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-apple-blue/20 focus:bg-white bg-white transition-all appearance-none cursor-pointer"
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function SmartCalculator() {
  const [weight, setWeight]       = useState(3)
  const [length, setLength]       = useState(35)
  const [width, setWidth]         = useState(25)
  const [height, setHeight]       = useState(20)
  const [categoryIdx, setCatIdx]  = useState(0)
  const [serviceIdx, setSvcIdx]   = useState(0)
  const [isBranded, setIsBranded] = useState(false)
  const [isFragile, setIsFragile] = useState(false)

  const category = RATES.CATEGORIES[categoryIdx]
  const service  = RATES.SERVICES[serviceIdx]
  const volumeKg = (length * width * height) / RATES.VOLUME_DIVISOR

  const input: CalcInput = {
    weightKg:          weight,
    lengthCm:          length,
    widthCm:           width,
    heightCm:          height,
    categorySurcharge: category.surcharge,
    serviceMultiplier: service.multiplier,
    isBranded,
    isFragile,
  }

  const result = calculate(input)

  const orderMsg = `Halo Webzoka Jastip! 🇯🇵\n\nSaya ingin order jastip dengan estimasi:\n\n📦 *DETAIL BARANG*\n- Kategori: ${category.label}\n- Berat: ${weight}kg\n- Dimensi: ${length}x${width}x${height} cm\n- Pengiriman: ${service.label}\n\n💰 *ESTIMASI TOTAL*\n*${formatRupiah(result.total)}*\n\n_(Sudah termasuk Pajak & Bea Cukai)_\n\nMohon info slot pengiriman terdekat ya!`
  const orderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderMsg)}`

  return (
    <section id="calculator" className="bg-[#F5F5F7] py-24 lg:py-32 px-4 relative overflow-hidden">
      {/* Decor */}
      <div className="absolute -left-32 top-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#0071E3] mb-4">Precision Tool</p>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 sf-display-heavy">
            Hitung Biaya Jastip Real-time
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Transparansi penuh tanpa biaya tersembunyi. Masukkan detail barang Anda untuk estimasi instan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — Form (Apple Style Card) */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 apple-shadow border border-black/[0.03] animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-apple-blue flex items-center justify-center">
                    <span className="text-xl">🇯🇵</span>
                </div>
                <h3 className="font-bold text-gray-900 text-xl tracking-tight">
                  Spesifikasi Barang
                </h3>
            </div>

            {/* Dimension + weight grid */}
            <div className="grid grid-cols-2 gap-5 mb-4">
              <InputField label="Berat (kg)"   value={weight} onChange={setWeight} min={0.1} step={0.1} />
              <InputField label="Panjang (cm)" value={length} onChange={setLength} min={1}   step={1}   />
              <InputField label="Lebar (cm)"   value={width}  onChange={setWidth}  min={1}   step={1}   />
              <InputField label="Tinggi (cm)"  value={height} onChange={setHeight} min={1}   step={1}   />
            </div>

            {/* Volume info */}
            <div className="flex items-center gap-2 text-[12px] text-apple-blue font-bold mb-8 bg-blue-50 border border-apple-blue/10 rounded-xl px-4 py-3">
              <Info size={14} />
              <span>Volume Weight: {volumeKg.toFixed(2)} kg</span>
              <span className="text-gray-400 font-normal ml-auto">Dimensi x Berat Divisor</span>
            </div>

            {/* Fields Stacking */}
            <div className="space-y-6">
                <SelectField
                    label="Kategori Barang"
                    value={categoryIdx}
                    onChange={setCatIdx}
                    options={RATES.CATEGORIES.map((c, i) => ({
                    value: i,
                    label: c.surcharge > 0
                        ? `${c.label} (+${formatRupiah(c.surcharge)})`
                        : c.label,
                    }))}
                />

                <SelectField
                    label="Jenis Layanan Pengiriman"
                    value={serviceIdx}
                    onChange={setSvcIdx}
                    options={RATES.SERVICES.map((s, i) => ({
                    value: i,
                    label: `${s.label} (Est. ${s.label === 'Air Cargo' ? '7-14' : '30-45'} hari)`,
                    }))}
                />

                <div className="grid grid-cols-2 gap-5">
                <SelectField
                    label="Layanan Branded"
                    value={isBranded ? 1 : 0}
                    onChange={v => setIsBranded(v === 1)}
                    options={[
                    { value: 0, label: 'Tidak' },
                    { value: 1, label: `Ya` },
                    ]}
                />
                <SelectField
                    label="Proteksi Pecah Belah"
                    value={isFragile ? 1 : 0}
                    onChange={v => setIsFragile(v === 1)}
                    options={[
                    { value: 0, label: 'Tidak' },
                    { value: 1, label: `Ya` },
                    ]}
                />
                </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-black/5">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <ShieldCheck size={14} className="text-green-500" />
                    Harga estimasi sudah termasuk Pajak Impor & Bea Cukai Indonesia.
                </div>
            </div>
          </div>

          {/* Right — Result Card (Premium Receipt Look) */}
          <div className="lg:sticky lg:top-32 space-y-6 animate-fade-up w-full" style={{animationDelay: '100ms'}}>
            <div className="bg-white rounded-[32px] p-6 md:p-10 apple-shadow border border-black/[0.03] relative overflow-hidden">
                {/* Visual Top Bar */}
                <div className="absolute top-0 inset-x-0 h-2 bg-apple-blue" />

                <div className="text-center mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total Estimasi Tagihan</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl sf-display-heavy text-[#1D1D1F] tracking-tight tabular-nums break-words">
                        {formatRupiah(result.total)}
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-dashed border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">Layanan</span>
                        <span className="font-bold text-gray-900">{service.label}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-dashed border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium text-left mr-2">Berat Aktual ({weight}kg)</span>
                        <span className="font-bold text-gray-900 text-right">{formatRupiah(result.basePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-dashed border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium text-left mr-2">Biaya Penyesuaian Vol.</span>
                        <span className="font-bold text-gray-900 text-right">{formatRupiah(result.volumePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-dashed border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium text-left mr-2">Add-ons (Cat/Brand)</span>
                        <span className="font-bold text-gray-900 text-right">{formatRupiah(result.extraPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-500 font-medium">Asuransi & Handling</span>
                        <span className="font-bold text-gray-900">{formatRupiah(result.insuranceHandling)}</span>
                    </div>
                </div>

                <div className="bg-[#F3FBF5] rounded-2xl p-4 mb-8 flex items-center gap-3 border border-[#E4F8EA]">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-sm shrink-0">
                        <ShieldCheck size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-green-700 uppercase tracking-wide">All-Inclusive Price</p>
                        <p className="text-[10px] text-green-600/70 font-medium leading-tight">Harga ini sudah termasuk biaya Bea Cukai & Pajak 100%.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <a
                    href={orderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#1D1D1F] hover:bg-black text-white font-bold rounded-2xl transition-all text-sm shadow-xl glow-button"
                    >
                    <MessageCircle size={18} />
                    Kirim Estimasi ke WhatsApp
                    </a>
                    
                    <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-black/5 text-gray-500 hover:text-black font-bold rounded-2xl transition-all text-sm hover:bg-gray-50">
                        <Download size={16} /> Simpan sebagai Gambar
                    </button>
                </div>
            </div>

            {/* Currency Note */}
            <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-black/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><ExternalLink size={12} /> Live JPY Rate</span>
                <span className="text-gray-300">|</span>
                <span>1 JPY = Rp 105.42</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
