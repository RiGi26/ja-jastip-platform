'use client'

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Download, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { MOCK_ORDERS } from '@/lib/mock-orders'
import { formatRupiah } from '@/lib/calculator'
import { exportOrdersCsv } from '@/lib/export'
import type { Order, OrderStatus } from '@/lib/types'
import OrderStatusBadge, { STATUS_LABELS } from '@/components/admin/orders/OrderStatusBadge'
import OrderForm from '@/components/admin/orders/OrderForm'
import OrderDetail from '@/components/admin/orders/OrderDetail'
import Modal from '@/components/admin/shared/Modal'
import SlideOver from '@/components/admin/shared/SlideOver'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import PermissionGuard from '@/components/admin/PermissionGuard'

const PAGE_SIZE = 10
const ALL_STATUSES: OrderStatus[] = ['menunggu', 'dikonfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan']

function getOrders(): Order[] {
  return storage.get<Order[]>(STORAGE_KEYS.ORDERS) ?? MOCK_ORDERS
}
function saveOrders(orders: Order[]): void {
  storage.set(STORAGE_KEYS.ORDERS, orders)
}
function makeOrderNumber(orders: Order[]): string {
  const n = orders.length + 1
  return `JA-2024-${String(n).padStart(3, '0')}`
}

type SortKey = 'createdAt' | 'customerName' | 'total' | 'status'

/* Shared input style */
const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ddd9d3',
  borderRadius: '10px',
  color: '#100e0b',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

function OrdersContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>(getOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true)
  }, [searchParams])

  const filtered = useMemo(() => {
    let list = orders
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.customerName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q),
      )
    }
    if (statusFilter) list = list.filter(o => o.status === statusFilter)
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else if (sortKey === 'customerName') cmp = a.customerName.localeCompare(b.customerName)
      else if (sortKey === 'total') cmp = a.total - b.total
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      return sortAsc ? cmp : -cmp
    })
  }, [orders, search, statusFilter, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  const addOrder = useCallback((data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => {
    const current = getOrders()
    const newOrder: Order = {
      ...data,
      id: `ord_${Date.now()}`,
      orderNumber: makeOrderNumber(current),
      createdAt: new Date().toISOString(),
      status: 'menunggu',
    }
    const updated = [newOrder, ...current]
    saveOrders(updated)
    setOrders(updated)
    setShowForm(false)
    toast('Pesanan berhasil ditambahkan')
  }, [toast])

  const changeStatus = useCallback((id: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o)
    saveOrders(updated)
    setOrders(updated)
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null)
    toast(`Status diubah menjadi ${STATUS_LABELS[status]}`)
  }, [orders, selectedOrder, toast])

  const deleteOrder = useCallback((id: string) => {
    const updated = orders.filter(o => o.id !== id)
    saveOrders(updated)
    setOrders(updated)
    setSelectedOrder(null)
    toast('Pesanan berhasil dihapus', 'info')
  }, [orders, toast])

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={11} style={{ color: '#c8c3bc' }} />
    return sortAsc
      ? <ChevronUp size={11} style={{ color: '#4f46e5' }} />
      : <ChevronDown size={11} style={{ color: '#4f46e5' }} />
  }

  return (
    <div className="space-y-5 font-jakarta">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
            Pesanan Masuk
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
            {orders.length} total pesanan
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission="orders.export">
            <button
              onClick={() => exportOrdersCsv(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#ffffff', border: '1px solid #e8e4de', color: '#6b6560' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff' }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </PermissionGuard>
          <PermissionGuard permission="orders.create">
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
              Tambah Pesanan
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9c9690' }} />
          <input
            type="text"
            placeholder="Cari nama atau nomor pesanan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5"
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
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9c9690' }} />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1) }}
            className="pl-8 pr-4 py-2.5"
            style={{ ...inputStyle, appearance: 'none', paddingRight: '32px' }}
            onFocus={e => {
              e.target.style.borderColor = '#4f46e5'
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#ddd9d3'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="">Semua Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
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
                <th className="text-left px-5 py-3">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Tanggal</span>
                    <SortIcon col="createdAt" />
                  </button>
                </th>
                <th className="text-left px-3 py-3">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Pelanggan</span>
                    <SortIcon col="customerName" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 hidden md:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Kategori</span>
                </th>
                <th className="text-left px-3 py-3 hidden sm:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Berat</span>
                </th>
                <th className="text-right px-3 py-3">
                  <button onClick={() => handleSort('total')} className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Total</span>
                    <SortIcon col="total" />
                  </button>
                </th>
                <th className="text-center px-5 py-3">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 mx-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>Status</span>
                    <SortIcon col="status" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="font-semibold" style={{ color: '#6b6560' }}>Tidak ada pesanan ditemukan</p>
                    <p className="text-xs mt-1" style={{ color: '#9c9690' }}>Coba ubah filter pencarian</p>
                  </td>
                </tr>
              ) : (
                paginated.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="table-row-hover cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid #faf9f7' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold" style={{ color: '#6b6560' }}>
                        {o.orderNumber}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9c9690' }}>
                        {new Date(o.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="px-3 py-3 font-semibold" style={{ color: '#100e0b' }}>{o.customerName}</td>
                    <td className="px-3 py-3 hidden md:table-cell text-sm" style={{ color: '#6b6560' }}>{o.category}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs" style={{ color: '#6b6560' }}>{o.weightKg}kg</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-mono font-bold text-sm" style={{ color: '#100e0b' }}>
                        {formatRupiah(o.total)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid #f0ede8' }}
          >
            <p className="text-xs" style={{ color: '#9c9690' }}>
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                  style={p === page ? {
                    background: '#4f46e5',
                    color: '#ffffff',
                  } : {
                    background: 'transparent',
                    color: '#6b6560',
                  }}
                  onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = '#f7f6f3' }}
                  onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Pesanan Manual" maxWidth="max-w-2xl">
        <OrderForm onSubmit={addOrder} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Order Detail SlideOver */}
      <SlideOver open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Detail Pesanan">
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onStatusChange={changeStatus}
            onDelete={deleteOrder}
          />
        )}
      </SlideOver>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(79,70,229,0.2)', borderTopColor: '#4f46e5' }}
          />
        </div>
      }>
        <OrdersContent />
      </Suspense>
    </ToastProvider>
  )
}
