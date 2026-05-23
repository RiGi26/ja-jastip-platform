'use client'

import { useState, useCallback } from 'react'
import { History, Plus, Trash2 } from 'lucide-react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { RATES } from '@/constants/rates'
import { calculate, formatRupiah, type CalcInput } from '@/lib/calculator'
import type { CalcHistoryItem, Order } from '@/lib/types'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import Modal from '@/components/admin/shared/Modal'
import OrderForm from '@/components/admin/orders/OrderForm'
import { MOCK_ORDERS } from '@/lib/mock-orders'

const MAX_HISTORY = 10

function getHistory(): CalcHistoryItem[] {
  return storage.get<CalcHistoryItem[]>(STORAGE_KEYS.CALC_HISTORY) ?? []
}

function getOrders(): Order[] {
  return storage.get<Order[]>(STORAGE_KEYS.ORDERS) ?? MOCK_ORDERS
}

function saveOrders(orders: Order[]): void {
  storage.set(STORAGE_KEYS.ORDERS, orders)
}

interface CalcState {
  weight: number
  length: number
  width: number
  height: number
  categoryIdx: number
  serviceIdx: number
  isBranded: boolean
  isFragile: boolean
}

const INITIAL: CalcState = {
  weight: 3, length: 35, width: 25, height: 20,
  categoryIdx: 0, serviceIdx: 0, isBranded: false, isFragile: false,
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

function CalculatorContent() {
  const { toast } = useToast()
  const [calc, setCalc] = useState<CalcState>(INITIAL)
  const [history, setHistory] = useState<CalcHistoryItem[]>(getHistory)
  const [showOrder, setShowOrder] = useState(false)

  const cat = RATES.CATEGORIES[calc.categoryIdx]
  const svc = RATES.SERVICES[calc.serviceIdx]
  const volumeKg = (calc.length * calc.width * calc.height) / RATES.VOLUME_DIVISOR

  const input: CalcInput = {
    weightKg: calc.weight,
    lengthCm: calc.length,
    widthCm: calc.width,
    heightCm: calc.height,
    categorySurcharge: cat.surcharge,
    serviceMultiplier: svc.multiplier,
    isBranded: calc.isBranded,
    isFragile: calc.isFragile,
  }
  const result = calculate(input)

  function setField<K extends keyof CalcState>(key: K, value: CalcState[K]) {
    setCalc(prev => ({ ...prev, [key]: value }))
  }

  function saveToHistory() {
    const item: CalcHistoryItem = {
      id: `ch_${Date.now()}`,
      savedAt: new Date().toISOString(),
      input: {
        weightKg: calc.weight,
        lengthCm: calc.length,
        widthCm: calc.width,
        heightCm: calc.height,
        category: cat.label,
        service: svc.label,
        isBranded: calc.isBranded,
        isFragile: calc.isFragile,
      },
      total: result.total,
    }
    const updated = [item, ...history].slice(0, MAX_HISTORY)
    storage.set(STORAGE_KEYS.CALC_HISTORY, updated)
    setHistory(updated)
    toast('Kalkulasi disimpan ke histori')
  }

  function clearHistory() {
    storage.remove(STORAGE_KEYS.CALC_HISTORY)
    setHistory([])
    toast('Histori dihapus', 'info')
  }

  function loadHistory(item: CalcHistoryItem) {
    const catIdx = RATES.CATEGORIES.findIndex(c => c.label === item.input.category)
    const svcIdx = RATES.SERVICES.findIndex(s => s.label === item.input.service)
    setCalc({
      weight: item.input.weightKg,
      length: item.input.lengthCm,
      width: item.input.widthCm,
      height: item.input.heightCm,
      categoryIdx: catIdx >= 0 ? catIdx : 0,
      serviceIdx: svcIdx >= 0 ? svcIdx : 0,
      isBranded: item.input.isBranded,
      isFragile: item.input.isFragile,
    })
  }

  const addOrder = useCallback((data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => {
    const current = getOrders()
    const n = current.length + 1
    const newOrder: Order = {
      ...data,
      id: `ord_${Date.now()}`,
      orderNumber: `JA-2024-${String(n).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'menunggu',
    }
    saveOrders([newOrder, ...current])
    setShowOrder(false)
    toast('Pesanan berhasil ditambahkan dari kalkulasi')
  }, [toast])

  function NumberInput({
    label, value, onChange, min = 0.1, step = 1,
  }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; step?: number
  }) {
    return (
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
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
          style={inputStyle}
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
    )
  }

  return (
    <div className="space-y-5 font-jakarta">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
          Kalkulator Ongkir
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
          Hitung biaya jastip dan buat pesanan langsung
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Input form */}
        <div
          className="xl:col-span-1 rounded-2xl p-5"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(232,48,58,0.10)', border: '1px solid rgba(232,48,58,0.20)' }}
            >
              🇯🇵
            </div>
            <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
              Detail Barang
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <NumberInput label="Berat (kg)" value={calc.weight} onChange={v => setField('weight', v)} min={0.1} step={0.1} />
            <NumberInput label="Panjang (cm)" value={calc.length} onChange={v => setField('length', v)} />
            <NumberInput label="Lebar (cm)" value={calc.width} onChange={v => setField('width', v)} />
            <NumberInput label="Tinggi (cm)" value={calc.height} onChange={v => setField('height', v)} />
          </div>

          <div
            className="mb-4 px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.12)', color: '#4f46e5' }}
          >
            📐 Volume: <span className="font-mono font-bold">{volumeKg.toFixed(2)} kg</span>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
                Kategori
              </label>
              <select
                value={calc.categoryIdx}
                onChange={e => setField('categoryIdx', Number(e.target.value))}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={e => {
                  e.target.style.borderColor = '#4f46e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#ddd9d3'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {RATES.CATEGORIES.map((c, i) => (
                  <option key={i} value={i}>
                    {c.label}{c.surcharge > 0 ? ` (+${formatRupiah(c.surcharge)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
                Layanan
              </label>
              <select
                value={calc.serviceIdx}
                onChange={e => setField('serviceIdx', Number(e.target.value))}
                style={{ ...inputStyle, appearance: 'none' }}
                onFocus={e => {
                  e.target.style.borderColor = '#4f46e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#ddd9d3'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {RATES.SERVICES.map((s, i) => (
                  <option key={i} value={i}>{s.label} (×{s.multiplier})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'isBranded', label: 'Branded', fee: RATES.BRANDED_FEE },
              { key: 'isFragile', label: 'Fragile', fee: RATES.FRAGILE_FEE },
            ] as const).map(t => (
              <label
                key={t.key}
                className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  border: calc[t.key] ? '1px solid rgba(79,70,229,0.3)' : '1px solid #ddd9d3',
                  background: calc[t.key] ? 'rgba(79,70,229,0.04)' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={calc[t.key]}
                  onChange={e => setField(t.key, e.target.checked)}
                  style={{ accentColor: '#4f46e5' }}
                />
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#100e0b' }}>{t.label}</p>
                  <p className="text-[10px]" style={{ color: '#9c9690' }}>+{formatRupiah(t.fee)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Result card */}
        <div className="xl:col-span-1">
          <div
            className="rounded-2xl p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #3730a3 0%, #1e1b4b 100%)' }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: 'rgba(165,180,252,0.8)' }}
            >
              Estimasi Total
            </p>
            <p className="font-mono text-4xl font-bold mb-1 tracking-tight">
              {formatRupiah(result.total)}
            </p>
            <p className="text-sm mb-5" style={{ color: 'rgba(165,180,252,0.8)' }}>
              {svc.label}
            </p>

            <div
              className="rounded-xl p-4 space-y-2.5 mb-5"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              {[
                { label: `Base (${calc.weight}kg)`, value: result.basePrice },
                { label: `Volume (${volumeKg.toFixed(2)}kg)`, value: result.volumePrice },
                ...(result.extraPrice > 0 ? [{ label: 'Kategori/Extra', value: result.extraPrice }] : []),
                { label: 'Insurance & Handling', value: result.insuranceHandling },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(165,180,252,0.8)' }}>{row.label}</span>
                  <span className="font-mono font-bold">{formatRupiah(row.value)}</span>
                </div>
              ))}
              <div
                className="pt-2.5 flex justify-between font-black text-sm"
                style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
              >
                <span>TOTAL</span>
                <span className="font-mono">{formatRupiah(result.total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowOrder(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all"
                style={{ background: '#ffffff', color: '#3730a3' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#eef2ff'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Plus size={15} />
                Buat Pesanan dari Kalkulasi Ini
              </button>
              <button
                onClick={saveToHistory}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.10)', color: '#ffffff' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
              >
                <History size={15} />
                Simpan ke Histori
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div
          className="xl:col-span-1 rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #f0ede8' }}
          >
            <h2 className="font-extrabold text-sm flex items-center gap-2 tracking-tight" style={{ color: '#100e0b' }}>
              <History size={14} style={{ color: '#9c9690' }} />
              Histori Kalkulasi
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                aria-label="Hapus semua histori"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#9c9690' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fee2e2'
                  e.currentTarget.style.color = '#dc2626'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#9c9690'
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="text-3xl mb-2">🧮</p>
              <p className="text-sm" style={{ color: '#9c9690' }}>Belum ada histori kalkulasi</p>
              <p className="text-xs mt-1" style={{ color: '#c8c3bc' }}>Simpan hasil kalkulasi untuk melihatnya di sini</p>
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: '#f7f6f3' }}>
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => loadHistory(item)}
                  className="w-full text-left px-5 py-3 transition-colors"
                  style={{ color: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm font-bold" style={{ color: '#100e0b' }}>
                        {formatRupiah(item.total)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9c9690' }}>
                        {item.input.category} · {item.input.weightKg}kg
                      </p>
                    </div>
                    <p className="text-[10px] font-mono" style={{ color: '#c8c3bc' }}>
                      {new Date(item.savedAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal open={showOrder} onClose={() => setShowOrder(false)} title="Buat Pesanan dari Kalkulasi" maxWidth="max-w-2xl">
        <OrderForm
          initial={{
            categoryIdx: calc.categoryIdx,
            serviceIdx: calc.serviceIdx,
            weightKg: calc.weight,
            lengthCm: calc.length,
            widthCm: calc.width,
            heightCm: calc.height,
            isBranded: calc.isBranded,
            isFragile: calc.isFragile,
          }}
          onSubmit={addOrder}
          onCancel={() => setShowOrder(false)}
          submitLabel="Buat Pesanan"
        />
      </Modal>
    </div>
  )
}

export default function CalculatorPage() {
  return (
    <ToastProvider>
      <CalculatorContent />
    </ToastProvider>
  )
}
