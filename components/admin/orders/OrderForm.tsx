'use client'

import { useState } from 'react'
import { RATES } from '@/constants/rates'
import { calculate, formatRupiah } from '@/lib/calculator'
import type { Order } from '@/lib/types'

interface OrderFormData {
  customerName: string
  customerWa: string
  categoryIdx: number
  serviceIdx: number
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isBranded: boolean
  isFragile: boolean
  notes: string
}

const EMPTY: OrderFormData = {
  customerName: '',
  customerWa: '',
  categoryIdx: 0,
  serviceIdx: 0,
  weightKg: 1,
  lengthCm: 20,
  widthCm: 15,
  heightCm: 10,
  isBranded: false,
  isFragile: false,
  notes: '',
}

interface OrderFormProps {
  initial?: Partial<OrderFormData>
  onSubmit: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => void
  onCancel: () => void
  submitLabel?: string
}

export default function OrderForm({ initial, onSubmit, onCancel, submitLabel = 'Simpan Pesanan' }: OrderFormProps) {
  const [form, setForm] = useState<OrderFormData>({ ...EMPTY, ...initial })
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({})

  const cat = RATES.CATEGORIES[form.categoryIdx]
  const svc = RATES.SERVICES[form.serviceIdx]
  const result = calculate({
    weightKg: form.weightKg,
    lengthCm: form.lengthCm,
    widthCm: form.widthCm,
    heightCm: form.heightCm,
    categorySurcharge: cat.surcharge,
    serviceMultiplier: svc.multiplier,
    isBranded: form.isBranded,
    isFragile: form.isFragile,
  })

  function set<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof OrderFormData, string>> = {}
    if (!form.customerName.trim()) e.customerName = 'Nama pelanggan wajib diisi'
    if (!form.customerWa.trim()) e.customerWa = 'Nomor WA wajib diisi'
    else if (!/^\+62\d{8,13}$/.test(form.customerWa.trim())) e.customerWa = 'Format nomor WA: +62xxx'
    if (form.weightKg <= 0) e.weightKg = 'Berat harus lebih dari 0'
    if (form.lengthCm <= 0) e.lengthCm = 'Dimensi harus lebih dari 0'
    if (form.widthCm <= 0) e.widthCm = 'Dimensi harus lebih dari 0'
    if (form.heightCm <= 0) e.heightCm = 'Dimensi harus lebih dari 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      customerName: form.customerName.trim(),
      customerWa: form.customerWa.trim(),
      category: cat.label,
      categorySurcharge: cat.surcharge,
      service: svc.label,
      serviceMultiplier: svc.multiplier,
      weightKg: form.weightKg,
      lengthCm: form.lengthCm,
      widthCm: form.widthCm,
      heightCm: form.heightCm,
      isBranded: form.isBranded,
      isFragile: form.isFragile,
      notes: form.notes,
      total: result.total,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
      {/* Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Nama Pelanggan
          </label>
          <input
            id="customerName"
            type="text"
            value={form.customerName}
            onChange={e => set('customerName', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Budi Santoso"
          />
          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
        </div>
        <div>
          <label htmlFor="customerWa" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Nomor WhatsApp
          </label>
          <input
            id="customerWa"
            type="text"
            value={form.customerWa}
            onChange={e => set('customerWa', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+6281234567890"
          />
          {errors.customerWa && <p className="text-red-500 text-xs mt-1">{errors.customerWa}</p>}
        </div>
      </div>

      {/* Category & Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Kategori Barang
          </label>
          <select
            id="category"
            value={form.categoryIdx}
            onChange={e => set('categoryIdx', Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RATES.CATEGORIES.map((c, i) => (
              <option key={i} value={i}>{c.label}{c.surcharge > 0 ? ` (+${formatRupiah(c.surcharge)})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Jenis Pengiriman
          </label>
          <select
            id="service"
            value={form.serviceIdx}
            onChange={e => set('serviceIdx', Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RATES.SERVICES.map((s, i) => (
              <option key={i} value={i}>{s.label} (×{s.multiplier})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dimensi & Berat</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { key: 'weightKg', label: 'Berat (kg)', step: 0.1, min: 0.1 },
            { key: 'lengthCm', label: 'Panjang (cm)', step: 1, min: 1 },
            { key: 'widthCm',  label: 'Lebar (cm)',   step: 1, min: 1 },
            { key: 'heightCm', label: 'Tinggi (cm)',  step: 1, min: 1 },
          ] as const).map(f => (
            <div key={f.key}>
              <label htmlFor={f.key} className="block text-[11px] font-semibold text-gray-400 mb-1">{f.label}</label>
              <input
                id={f.key}
                type="number"
                min={f.min}
                step={f.step}
                value={form[f.key]}
                onChange={e => set(f.key as keyof OrderFormData, f.step < 1 ? parseFloat(e.target.value) || f.min : parseInt(e.target.value) || f.min)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4">
        {([
          { key: 'isBranded', label: 'Barang Branded', fee: RATES.BRANDED_FEE },
          { key: 'isFragile', label: 'Fragile / Mudah Pecah', fee: RATES.FRAGILE_FEE },
        ] as const).map(t => (
          <label key={t.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form[t.key]}
              onChange={e => set(t.key, e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">{t.label}</p>
              <p className="text-xs text-gray-400">+{formatRupiah(t.fee)}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Catatan Tambahan
        </label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Warna, ukuran, atau instruksi khusus..."
        />
      </div>

      {/* Total Preview */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Estimasi Total</p>
        <p className="text-2xl font-black text-blue-700">{formatRupiah(result.total)}</p>
        <div className="mt-2 text-xs text-blue-500 space-y-0.5">
          <div className="flex justify-between"><span>Base ({form.weightKg}kg)</span><span>{formatRupiah(result.basePrice)}</span></div>
          <div className="flex justify-between"><span>Volume</span><span>{formatRupiah(result.volumePrice)}</span></div>
          {result.extraPrice > 0 && <div className="flex justify-between"><span>Extra</span><span>{formatRupiah(result.extraPrice)}</span></div>}
          <div className="flex justify-between"><span>Insurance & Handling</span><span>{formatRupiah(result.insuranceHandling)}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
