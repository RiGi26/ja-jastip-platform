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

function FinanceContent() {
  const { toast } = useToast()
  const { isOwner } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth())
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)

  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fType, setFType] = useState<TransactionType>('masuk')
  const [fAmount, setFAmount] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fErrors, setFErrors] = useState<Record<string, string>>({})

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="font-extrabold text-lg" style={{ color: '#100e0b' }}>Akses Terbatas</p>
        <p className="text-sm mt-1" style={{ color: '#9c9690' }}>
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
  const ytdIncome = transactions
    .filter(t => new Date(t.date).getFullYear() === filterYear && t.type === 'masuk')
    .reduce((s, t) => s + t.amount, 0)

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

  function handlePrint() { window.print() }

  const focusStyle = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#4f46e5'
      e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#ddd9d3'
      e.target.style.boxShadow = 'none'
    },
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

      <div className="space-y-5 no-print font-jakarta">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
              Keuangan
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
              Ringkasan pemasukan &amp; pengeluaran
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Export CSV', icon: <Download size={14} />, onClick: () => exportTransactionsCsv(filtered) },
              { label: 'Print PDF', icon: <Printer size={14} />, onClick: handlePrint },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#ffffff', border: '1px solid #e8e4de', color: '#6b6560' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff' }}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: '#4f46e5' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4338ca'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Plus size={14} />
              Tambah Catatan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Pemasukan Bulan Ini"
            value={formatRupiah(thisMonthIncome)}
            icon={<TrendingUp size={16} style={{ color: '#16a34a' }} />}
            iconBg="bg-green-100"
            accent="green"
          />
          <StatsCard
            title="Pengeluaran Bulan Ini"
            value={formatRupiah(thisMonthOut)}
            icon={<TrendingDown size={16} style={{ color: '#dc2626' }} />}
            iconBg="bg-red-100"
            accent="red"
          />
          <StatsCard
            title="Rata-rata Nilai Order"
            value={formatRupiah(avgOrderValue)}
            icon={<TrendingUp size={16} style={{ color: '#4f46e5' }} />}
            iconBg="bg-indigo-100"
            accent="indigo"
            subtitle={`dari ${completedOrders.length} pesanan selesai`}
          />
          <StatsCard
            title="Pemasukan Kotor YTD"
            value={formatRupiah(ytdIncome)}
            icon={<TrendingUp size={16} style={{ color: '#7c3aed' }} />}
            iconBg="bg-violet-100"
            accent="violet"
            subtitle={`Tahun ${filterYear}`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9c9690' }} />
            <input
              type="text"
              placeholder="Cari nama atau nomor pesanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5"
              style={inputStyle}
              {...focusStyle}
            />
          </div>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-3 py-2.5"
            style={{ ...inputStyle, width: 'auto', appearance: 'none', paddingRight: '28px' }}
            {...focusStyle}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))}
            className="px-3 py-2.5"
            style={{ ...inputStyle, width: 'auto', appearance: 'none', paddingRight: '28px' }}
            {...focusStyle}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#faf9f7', borderBottom: '1px solid #f0ede8' }}>
                  {['Tanggal', 'No. Pesanan', 'Keterangan', 'Nominal', 'Tipe'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3 ${i === 0 ? 'text-left px-5' : i === 1 ? 'text-left px-3 hidden md:table-cell' : i === 3 ? 'text-right px-3' : i === 4 ? 'text-center px-5' : 'text-left px-3'}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <p className="text-4xl mb-3">💰</p>
                      <p className="font-semibold" style={{ color: '#6b6560' }}>Belum ada transaksi di bulan ini</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => (
                    <tr
                      key={t.id}
                      className="table-row-hover transition-colors"
                      style={{ borderBottom: '1px solid #faf9f7' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td className="px-5 py-3 text-xs" style={{ color: '#6b6560' }}>
                        {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs hidden md:table-cell" style={{ color: '#9c9690' }}>
                        {t.orderNumber ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-sm" style={{ color: '#100e0b' }}>{t.description}</p>
                        {t.customerName && (
                          <p className="text-xs mt-0.5" style={{ color: '#9c9690' }}>{t.customerName}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className="font-mono font-black text-sm"
                          style={{ color: t.type === 'masuk' ? '#16a34a' : '#dc2626' }}
                        >
                          {t.type === 'masuk' ? '+' : '−'}{formatRupiah(t.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                          style={t.type === 'masuk'
                            ? { background: 'rgba(22,163,74,0.10)', color: '#15803d' }
                            : { background: 'rgba(220,38,38,0.10)', color: '#b91c1c' }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: t.type === 'masuk' ? '#16a34a' : '#dc2626' }}
                          />
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Catatan Keuangan" accentColor="#16a34a">
        <div className="px-6 py-5 space-y-4">
          {[
            {
              id: 'fDate', label: 'Tanggal', error: fErrors.date,
              input: <input id="fDate" type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={inputStyle} {...focusStyle} />,
            },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
                {f.label}
              </label>
              {f.input}
              {f.error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{f.error}</p>}
            </div>
          ))}

          <div>
            <label htmlFor="fType" className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
              Tipe Transaksi
            </label>
            <select
              id="fType"
              value={fType}
              onChange={e => setFType(e.target.value as TransactionType)}
              style={{ ...inputStyle, appearance: 'none' }}
              {...focusStyle}
            >
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </select>
          </div>

          <div>
            <label htmlFor="fAmount" className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
              Nominal (Rp)
            </label>
            <input
              id="fAmount"
              type="number"
              min={1}
              value={fAmount}
              onChange={e => setFAmount(e.target.value)}
              placeholder="500000"
              style={inputStyle}
              {...focusStyle}
            />
            {fErrors.amount && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fErrors.amount}</p>}
          </div>

          <div>
            <label htmlFor="fDesc" className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#9c9690' }}>
              Keterangan
            </label>
            <textarea
              id="fDesc"
              value={fDesc}
              onChange={e => setFDesc(e.target.value)}
              rows={2}
              placeholder="Biaya operasional, pembayaran pesanan, dll"
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
            {fErrors.desc && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{fErrors.desc}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #e8e4de', color: '#6b6560' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Batal
            </button>
            <button
              onClick={addTransaction}
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
              Simpan
            </button>
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
