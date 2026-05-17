'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, Download, Printer, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { MOCK_TRANSACTIONS } from '@/lib/mock-transactions'
import { MOCK_ORDERS } from '@/lib/mock-orders'
import { formatRupiah } from '@/lib/calculator'
import { exportTransactionsCsv } from '@/lib/export'
import type { Transaction, TransactionType } from '@/lib/types'
import StatsCard from '@/components/admin/shared/StatsCard'
import Modal from '@/components/admin/shared/Modal'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import { useAuth } from '@/contexts/AuthContext'

function getTransactions(): Transaction[] {
  return storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) ?? MOCK_TRANSACTIONS
}
function saveTransactions(t: Transaction[]): void {
  storage.set(STORAGE_KEYS.TRANSACTIONS, t)
}

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const now = new Date()

function FinanceContent() {
  const { toast } = useToast()
  const { isOwner } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth())
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fType, setFType] = useState<TransactionType>('masuk')
  const [fAmount, setFAmount] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fErrors, setFErrors] = useState<Record<string, string>>({})

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="font-black text-gray-700 text-lg">Akses Terbatas</p>
        <p className="text-gray-400 text-sm mt-1">
          Halaman ini hanya bisa diakses oleh pemilik usaha.
        </p>
      </div>
    )
  }

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      const matchMonth = d.getMonth() === filterMonth && d.getFullYear() === filterYear
      const matchSearch = !search ||
        (t.customerName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (t.orderNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchMonth && matchSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filterMonth, filterYear, search])

  const thisMonthIncome = filtered.filter(t => t.type === 'masuk').reduce((s, t) => s + t.amount, 0)
  const thisMonthOut = filtered.filter(t => t.type === 'keluar').reduce((s, t) => s + t.amount, 0)
  const orders = storage.get<typeof MOCK_ORDERS>(STORAGE_KEYS.ORDERS) ?? MOCK_ORDERS
  const completedOrders = orders.filter(o => o.status === 'selesai')
  const avgOrderValue = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((s, o) => s + o.total, 0) / completedOrders.length)
    : 0
  const ytdIncome = transactions.filter(t => new Date(t.date).getFullYear() === filterYear && t.type === 'masuk').reduce((s, t) => s + t.amount, 0)

  function validateForm(): boolean {
    const e: Record<string, string> = {}
    if (!fDate) e.date = 'Tanggal wajib diisi'
    const amt = Number(fAmount)
    if (!fAmount || isNaN(amt) || amt <= 0) e.amount = 'Nominal harus angka positif'
    if (!fDesc.trim()) e.desc = 'Keterangan wajib diisi'
    setFErrors(e)
    return Object.keys(e).length === 0
  }

  const addTransaction = useCallback(() => {
    if (!validateForm()) return
    const newT: Transaction = {
      id: `trx_${Date.now()}`,
      date: fDate,
      amount: Number(fAmount),
      type: fType,
      description: fDesc.trim(),
    }
    const updated = [newT, ...transactions]
    saveTransactions(updated)
    setTransactions(updated)
    setShowForm(false)
    setFAmount('')
    setFDesc('')
    setFErrors({})
    toast('Transaksi berhasil ditambahkan')
  }, [fDate, fType, fAmount, fDesc, transactions, toast])

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#print-area) { display: none !important; }
          #print-area { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-5 no-print">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-900">Keuangan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Ringkasan pemasukan & pengeluaran</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportTransactionsCsv(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Printer size={15} />
              Print PDF
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
            >
              <Plus size={15} />
              Tambah Catatan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Pemasukan Bulan Ini"
            value={formatRupiah(thisMonthIncome)}
            icon={<TrendingUp size={18} className="text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Pengeluaran Bulan Ini"
            value={formatRupiah(thisMonthOut)}
            icon={<TrendingDown size={18} className="text-red-500" />}
            iconBg="bg-red-100"
          />
          <StatsCard
            title="Rata-rata Nilai Order"
            value={formatRupiah(avgOrderValue)}
            icon={<TrendingUp size={18} className="text-blue-600" />}
            iconBg="bg-blue-100"
            subtitle={`dari ${completedOrders.length} pesanan selesai`}
          />
          <StatsCard
            title="Pemasukan Kotor YTD"
            value={formatRupiah(ytdIncome)}
            icon={<TrendingUp size={18} className="text-violet-600" />}
            iconBg="bg-violet-100"
            subtitle={`Tahun ${filterYear}`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau nomor pesanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Tanggal</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3 hidden md:table-cell">No. Pesanan</th>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Keterangan</th>
                  <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Nominal</th>
                  <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Tipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <p className="text-4xl mb-3">💰</p>
                      <p className="font-semibold text-gray-500">Belum ada transaksi di bulan ini</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-400 hidden md:table-cell">{t.orderNumber ?? '-'}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-800">{t.description}</p>
                        {t.customerName && <p className="text-xs text-gray-400 mt-0.5">{t.customerName}</p>}
                      </td>
                      <td className={`px-3 py-3 text-right font-black ${t.type === 'masuk' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.type === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'masuk' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Catatan Keuangan">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="fDate" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tanggal</label>
            <input id="fDate" type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {fErrors.date && <p className="text-red-500 text-xs mt-1">{fErrors.date}</p>}
          </div>
          <div>
            <label htmlFor="fType" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipe Transaksi</label>
            <select id="fType" value={fType} onChange={e => setFType(e.target.value as TransactionType)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label htmlFor="fAmount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nominal (Rp)</label>
            <input id="fAmount" type="number" min={1} value={fAmount} onChange={e => setFAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500000" />
            {fErrors.amount && <p className="text-red-500 text-xs mt-1">{fErrors.amount}</p>}
          </div>
          <div>
            <label htmlFor="fDesc" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Keterangan</label>
            <textarea id="fDesc" value={fDesc} onChange={e => setFDesc(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Biaya operasional, pembayaran pesanan, dll" />
            {fErrors.desc && <p className="text-red-500 text-xs mt-1">{fErrors.desc}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={addTransaction} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Simpan</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default function FinancePage() {
  return (
    <ToastProvider>
      <FinanceContent />
    </ToastProvider>
  )
}
