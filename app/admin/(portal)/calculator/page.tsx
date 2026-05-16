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

const INITIAL: CalcState = { weight: 3, length: 35, width: 25, height: 20, categoryIdx: 0, serviceIdx: 0, isBranded: false, isFragile: false }

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

  function NumberInput({ label, value, onChange, min = 0.1, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number }) {
    return (
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => {
            const v = step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value)
            onChange(isNaN(v) ? min : Math.max(min, v))
          }}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Kalkulator Ongkir</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hitung biaya jastip dan buat pesanan langsung</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input form */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-gray-900 text-sm mb-4">🇯🇵 Detail Barang</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <NumberInput label="Berat (kg)" value={calc.weight} onChange={v => setField('weight', v)} min={0.1} step={0.1} />
            <NumberInput label="Panjang (cm)" value={calc.length} onChange={v => setField('length', v)} />
            <NumberInput label="Lebar (cm)" value={calc.width} onChange={v => setField('width', v)} />
            <NumberInput label="Tinggi (cm)" value={calc.height} onChange={v => setField('height', v)} />
          </div>

          <p className="text-xs text-blue-600 font-semibold mb-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            📐 Volume: <strong>{volumeKg.toFixed(2)} kg</strong>
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kategori</label>
              <select value={calc.categoryIdx} onChange={e => setField('categoryIdx', Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {RATES.CATEGORIES.map((c, i) => <option key={i} value={i}>{c.label}{c.surcharge > 0 ? ` (+${formatRupiah(c.surcharge)})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Layanan</label>
              <select value={calc.serviceIdx} onChange={e => setField('serviceIdx', Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {RATES.SERVICES.map((s, i) => <option key={i} value={i}>{s.label} (×{s.multiplier})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'isBranded', label: 'Branded', fee: RATES.BRANDED_FEE },
              { key: 'isFragile', label: 'Fragile', fee: RATES.FRAGILE_FEE },
            ] as const).map(t => (
              <label key={t.key} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={calc[t.key]} onChange={e => setField(t.key, e.target.checked)} className="rounded text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                  <p className="text-[10px] text-gray-400">+{formatRupiah(t.fee)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1e3a8a 100%)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Estimasi Total</p>
            <p className="text-4xl font-black mb-1">{formatRupiah(result.total)}</p>
            <p className="text-blue-200 text-sm mb-5">{svc.label}</p>

            <div className="bg-white/10 rounded-xl p-4 space-y-2.5 mb-5">
              <div className="flex justify-between text-sm"><span className="text-blue-200">Base ({calc.weight}kg)</span><span className="font-bold">{formatRupiah(result.basePrice)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-200">Volume ({volumeKg.toFixed(2)}kg)</span><span className="font-bold">{formatRupiah(result.volumePrice)}</span></div>
              {result.extraPrice > 0 && <div className="flex justify-between text-sm"><span className="text-blue-200">Kategori/Extra</span><span className="font-bold">{formatRupiah(result.extraPrice)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-blue-200">Insurance & Handling</span><span className="font-bold">{formatRupiah(result.insuranceHandling)}</span></div>
              <div className="border-t border-white/20 pt-2.5 flex justify-between font-black text-sm"><span>TOTAL</span><span>{formatRupiah(result.total)}</span></div>
            </div>

            <div className="space-y-2">
              <button onClick={() => setShowOrder(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-colors text-sm">
                <Plus size={15} />
                Buat Pesanan dari Kalkulasi Ini
              </button>
              <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-sm">
                <History size={15} />
                Simpan ke Histori
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <History size={15} className="text-gray-400" />
              Histori Kalkulasi
            </h2>
            {history.length > 0 && (
              <button onClick={clearHistory} aria-label="Hapus semua histori" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="text-3xl mb-2">🧮</p>
              <p className="text-gray-400 text-sm">Belum ada histori kalkulasi</p>
              <p className="text-gray-300 text-xs mt-1">Simpan hasil kalkulasi untuk melihatnya di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => loadHistory(item)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{formatRupiah(item.total)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.input.category} · {item.input.weightKg}kg</p>
                    </div>
                    <p className="text-[10px] text-gray-300">
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
