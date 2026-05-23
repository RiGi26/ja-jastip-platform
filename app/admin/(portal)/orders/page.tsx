'use client'

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Download, ChevronUp, ChevronDown, Filter, Package } from 'lucide-react'
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
    if (sortKey !== col) return <ChevronUp size={11} className="text-gray-300" />
    return sortAsc
      ? <ChevronUp size={11} className="text-apple-blue" />
      : <ChevronDown size={11} className="text-apple-blue" />
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header Section (Apple Style) */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <p className="text-[12px] text-gray-500 mb-1.5 font-bold uppercase tracking-widest flex items-center gap-2 sf-display">
            <span className="w-2 h-2 rounded-full bg-apple-blue"></span>
            Management Console • {orders.length} Active Orders
          </p>
          <h1 className="text-[40px] sf-display-heavy tracking-tight text-[#1D1D1F] leading-tight">
            Pesanan Masuk.
          </h1>
        </div>
        <div className="flex gap-3">
          <PermissionGuard permission="orders.export">
            <button
              onClick={() => exportOrdersCsv(filtered)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-black/5 rounded-full text-sm sf-display text-gray-600 hover:bg-gray-50 transition-all apple-shadow"
            >
              <Download size={16} /> Export CSV
            </button>
          </PermissionGuard>
          <PermissionGuard permission="orders.create">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white rounded-full text-sm sf-display-heavy hover:bg-black transition-all shadow-lg glow-button"
            >
              <Plus size={18} /> Tambah Pesanan
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filter Bar (Premium Styling) */}
      <div className="flex flex-wrap gap-4 items-center animate-fade-up delay-100">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor pesanan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-apple-blue/5 transition-all apple-shadow"
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1) }}
            className="pl-11 pr-10 py-3 bg-white border border-black/5 rounded-2xl text-[15px] sf-display text-gray-600 focus:outline-none focus:ring-4 focus:ring-apple-blue/5 transition-all apple-shadow appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table (Apple-Glass Card style) */}
      <div className="bg-white rounded-[32px] apple-shadow border border-black/[0.03] overflow-hidden animate-fade-up delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-black/5">
                <th className="px-8 py-5">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 group">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600 transition-colors">Tanggal</span>
                    <SortIcon col="createdAt" />
                  </button>
                </th>
                <th className="px-6 py-5">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-2 group">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600 transition-colors">Pelanggan</span>
                    <SortIcon col="customerName" />
                  </button>
                </th>
                <th className="px-6 py-5 hidden md:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Kategori</span>
                </th>
                <th className="px-6 py-5 hidden sm:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Berat</span>
                </th>
                <th className="px-6 py-5 text-right">
                  <button onClick={() => handleSort('total')} className="flex items-center gap-2 group ml-auto">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600 transition-colors">Total</span>
                    <SortIcon col="total" />
                  </button>
                </th>
                <th className="px-8 py-5 text-center">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-2 group mx-auto">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600 transition-colors">Status</span>
                    <SortIcon col="status" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-gray-300" />
                    </div>
                    <p className="text-[#1D1D1F] sf-display-heavy text-lg">Tidak ada pesanan</p>
                    <p className="text-sm text-gray-400 mt-1">Gunakan filter lain atau tambah pesanan baru.</p>
                  </td>
                </tr>
              ) : (
                paginated.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <p className="font-mono text-xs font-bold text-[#1D1D1F]">
                        {o.orderNumber}
                      </p>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-bold text-[#1D1D1F] sf-display text-[15px]">{o.customerName}</td>
                    <td className="px-6 py-5 hidden md:table-cell text-sm text-gray-500 font-medium">{o.category}</td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px] font-mono font-bold text-gray-600 uppercase">{o.weightKg}kg</span>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-apple-blue text-[15px]">
                      {formatRupiah(o.total)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Apple Style) */}
        {totalPages > 1 && (
          <div className="px-8 py-5 bg-gray-50/30 border-t border-black/5 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">
               Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    p === page 
                      ? 'bg-apple-blue text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white border border-black/5 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Order Modal (Apple Glass Redesigned) */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Pesanan Manual" maxWidth="max-w-2xl">
        <div className="p-2">
            <OrderForm onSubmit={addOrder} onCancel={() => setShowForm(false)} />
        </div>
      </Modal>

      {/* Order Detail SlideOver (Apple Glass Redesigned) */}
      <SlideOver open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Detail Pesanan">
        {selectedOrder && (
          <div className="animate-fade-in">
              <OrderDetail
                order={selectedOrder}
                onStatusChange={changeStatus}
                onDelete={deleteOrder}
              />
          </div>
        )}
      </SlideOver>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin" />
        </div>
      }>
        <OrdersContent />
      </Suspense>
    </ToastProvider>
  )
}
