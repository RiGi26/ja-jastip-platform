'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
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
      <label className="block text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">
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
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
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
      <label className="block text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      <select
        value={String(value)}
        onChange={e => {
          const raw = e.target.value
          onChange((typeof value === 'number' ? Number(raw) : raw) as T)
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
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

  const orderMsg = `Halo JapanArena Jastip! 🇯🇵\n\nSaya ingin order jastip dengan estimasi:\n- Total: ${formatRupiah(result.total)}\n- Berat: ${weight}kg\n- Kategori: ${category.label}\n- Pengiriman: ${service.label}\n\nMohon info lebih lanjut ya!`
  const orderUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderMsg)}`

  return (
    <section id="calculator" className="bg-white py-20 lg:py-28 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Smart Calculator</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
            Hitung Biaya Jastip Sekarang
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Masukkan detail barang dari Jepang — total biaya update otomatis realtime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Form */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-black text-gray-900 text-base mb-5 flex items-center gap-2">
              🇯🇵 Detail Barang dari Jepang
            </h3>

            {/* Dimension + weight grid */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <InputField label="Berat (kg)"   value={weight} onChange={setWeight} min={0.1} step={0.1} />
              <InputField label="Panjang (cm)" value={length} onChange={setLength} min={1}   step={1}   />
              <InputField label="Lebar (cm)"   value={width}  onChange={setWidth}  min={1}   step={1}   />
              <InputField label="Tinggi (cm)"  value={height} onChange={setHeight} min={1}   step={1}   />
            </div>

            {/* Volume info */}
            <p className="text-xs text-blue-600 font-semibold mb-5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              📐 Volume: <strong>{volumeKg.toFixed(2)} kg</strong> &nbsp;({length}×{width}×{height} ÷ {RATES.VOLUME_DIVISOR.toLocaleString('id-ID')})
            </p>

            {/* Category */}
            <div className="mb-4">
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
            </div>

            {/* Service */}
            <div className="mb-4">
              <SelectField
                label="Jenis Pengiriman"
                value={serviceIdx}
                onChange={setSvcIdx}
                options={RATES.SERVICES.map((s, i) => ({
                  value: i,
                  label: `${s.label} (×${s.multiplier})`,
                }))}
              />
            </div>

            {/* Branded + Fragile */}
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Barang Branded?"
                value={isBranded ? 1 : 0}
                onChange={v => setIsBranded(v === 1)}
                options={[
                  { value: 0, label: 'Tidak' },
                  { value: 1, label: `Ya (+${formatRupiah(RATES.BRANDED_FEE)})` },
                ]}
              />
              <SelectField
                label="Fragile / Mudah Pecah?"
                value={isFragile ? 1 : 0}
                onChange={v => setIsFragile(v === 1)}
                options={[
                  { value: 0, label: 'Tidak' },
                  { value: 1, label: `Ya (+${formatRupiah(RATES.FRAGILE_FEE)})` },
                ]}
              />
            </div>
          </div>

          {/* Right — Result Card */}
          <div
            className="rounded-2xl p-6 text-white lg:sticky lg:top-24"
            style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1e3a8a 100%)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">
              Estimasi Total Jastip
            </p>

            {/* Total */}
            <p className="text-4xl font-black text-white mb-1">
              {formatRupiah(result.total)}
            </p>
            <p className="text-blue-200 text-sm mb-6">
              Total estimasi · {service.label}
            </p>

            {/* Breakdown */}
            <div className="bg-white/10 rounded-xl p-4 space-y-2.5 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Base Japan Cargo ({weight}kg)</span>
                <span className="font-bold text-white">{formatRupiah(result.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Volume Adjust. ({volumeKg.toFixed(2)}kg)</span>
                <span className="font-bold text-white">{formatRupiah(result.volumePrice)}</span>
              </div>
              {result.extraPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Kategori / Branded / Fragile</span>
                  <span className="font-bold text-white">{formatRupiah(result.extraPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Insurance & Handling</span>
                <span className="font-bold text-white">{formatRupiah(result.insuranceHandling)}</span>
              </div>
              <div className="border-t border-white/20 pt-2.5 flex justify-between font-black">
                <span className="text-white text-sm">TOTAL</span>
                <span className="text-white">{formatRupiah(result.total)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['Japan Cargo', 'Luxury Support', 'Anime Goods', 'Live Tracking'].map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-black px-2.5 py-1 bg-white/15 border border-white/10 rounded-full text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-xl transition-all text-sm shadow-lg shadow-green-900/30"
            >
              <MessageCircle size={16} />
              Order via WhatsApp
            </a>

            <p className="text-center text-blue-200/60 text-[10px] mt-3">
              Harga akhir dikonfirmasi oleh tim kami via WA
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
