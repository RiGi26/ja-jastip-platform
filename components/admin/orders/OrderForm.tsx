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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #ddd9d3',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#100e0b',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#4f46e5'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#ddd9d3'
    e.target.style.boxShadow = 'none'
  },
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

  const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
      style={{ color: '#9c9690' }}
    >
      {children}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4 font-jakarta">

      {/* Customer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="customerName">Nama Pelanggan</FieldLabel>
          <input
            id="customerName"
            type="text"
            value={form.customerName}
            onChange={e => set('customerName', e.target.value)}
            placeholder="Budi Santoso"
            style={inputStyle}
            {...focusHandlers}
          />
          {errors.customerName && (
            <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.customerName}</p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="customerWa">Nomor WhatsApp</FieldLabel>
          <input
            id="customerWa"
            type="text"
            value={form.customerWa}
            onChange={e => set('customerWa', e.target.value)}
            placeholder="+6281234567890"
            style={inputStyle}
            {...focusHandlers}
          />
          {errors.customerWa && (
            <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.customerWa}</p>
          )}
        </div>
      </div>

      {/* Category & Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor="category">Kategori Barang</FieldLabel>
          <select
            id="category"
            value={form.categoryIdx}
            onChange={e => set('categoryIdx', Number(e.target.value))}
            style={{ ...inputStyle, appearance: 'none' }}
            {...focusHandlers}
          >
            {RATES.CATEGORIES.map((c, i) => (
              <option key={i} value={i}>
                {c.label}{c.surcharge > 0 ? ` (+${formatRupiah(c.surcharge)})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="service">Jenis Pengiriman</FieldLabel>
          <select
            id="service"
            value={form.serviceIdx}
            onChange={e => set('serviceIdx', Number(e.target.value))}
            style={{ ...inputStyle, appearance: 'none' }}
            {...focusHandlers}
          >
            {RATES.SERVICES.map((s, i) => (
              <option key={i} value={i}>{s.label} (×{s.multiplier})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9c9690' }}>
          Dimensi &amp; Berat
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { key: 'weightKg', label: 'Berat (kg)',   step: 0.1, min: 0.1 },
            { key: 'lengthCm', label: 'Panjang (cm)', step: 1,   min: 1 },
            { key: 'widthCm',  label: 'Lebar (cm)',   step: 1,   min: 1 },
            { key: 'heightCm', label: 'Tinggi (cm)',  step: 1,   min: 1 },
          ] as const).map(f => (
            <div key={f.key}>
              <label
                htmlFor={f.key}
                className="block text-[10px] font-semibold mb-1"
                style={{ color: '#9c9690' }}
              >
                {f.label}
              </label>
              <input
                id={f.key}
                type="number"
                min={f.min}
                step={f.step}
                value={form[f.key]}
                onChange={e => set(
                  f.key as keyof OrderFormData,
                  f.step < 1 ? parseFloat(e.target.value) || f.min : parseInt(e.target.value) || f.min,
                )}
                style={{ ...inputStyle, padding: '8px 12px' }}
                {...focusHandlers}
              />
              {errors[f.key] && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { key: 'isBranded', label: 'Barang Branded',       fee: RATES.BRANDED_FEE },
          { key: 'isFragile', label: 'Fragile / Mudah Pecah', fee: RATES.FRAGILE_FEE },
        ] as const).map(t => (
          <label
            key={t.key}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
            style={{
              border: form[t.key] ? '1px solid rgba(79,70,229,0.25)' : '1px solid #ddd9d3',
              background: form[t.key] ? 'rgba(79,70,229,0.04)' : 'transparent',
            }}
          >
            <input
              type="checkbox"
              checked={form[t.key]}
              onChange={e => set(t.key, e.target.checked)}
              style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#100e0b' }}>{t.label}</p>
              <p className="text-xs" style={{ color: '#9c9690' }}>+{formatRupiah(t.fee)}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Notes */}
      <div>
        <FieldLabel htmlFor="notes">Catatan Tambahan</FieldLabel>
        <textarea
          id="notes"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          placeholder="Warna, ukuran, atau instruksi khusus..."
          style={{ ...inputStyle, resize: 'none' }}
          onFocus={e => {
            e.target.style.borderColor = '#4f46e5'
            e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#ddd9d3'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Total preview */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#4f46e5' }}>
          Estimasi Total
        </p>
        <p className="font-mono font-black text-2xl" style={{ color: '#3730a3' }}>
          {formatRupiah(result.total)}
        </p>
        <div className="mt-2 space-y-0.5 text-xs" style={{ color: '#6366f1' }}>
          <div className="flex justify-between">
            <span>Base ({form.weightKg}kg)</span>
            <span className="font-mono">{formatRupiah(result.basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Volume</span>
            <span className="font-mono">{formatRupiah(result.volumePrice)}</span>
          </div>
          {result.extraPrice > 0 && (
            <div className="flex justify-between">
              <span>Extra</span>
              <span className="font-mono">{formatRupiah(result.extraPrice)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Insurance &amp; Handling</span>
            <span className="font-mono">{formatRupiah(result.insuranceHandling)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'transparent', border: '1px solid #e8e4de', color: '#6b6560' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: '#4f46e5' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4338ca'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#4f46e5'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
