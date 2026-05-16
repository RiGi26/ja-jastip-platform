'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
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
    if (sortKey !== col) return <ChevronUp size={12} className="text-gray-300" />
    return sortAsc ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Pesanan Masuk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total pesanan</p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission="orders.export">
            <button
              onClick={() => exportOrdersCsv(filtered)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
          </PermissionGuard>
          <PermissionGuard permission="orders.create">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
            >
              <Plus size={15} />
              Tambah Pesanan
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor pesanan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1) }}
            className="pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tanggal <SortIcon col="createdAt" />
                  </button>
                </th>
                <th className="text-left px-3 py-3">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Pelanggan <SortIcon col="customerName" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 hidden md:table-cell">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</span>
                </th>
                <th className="text-left px-3 py-3 hidden sm:table-cell">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Berat</span>
                </th>
                <th className="text-right px-3 py-3">
                  <button onClick={() => handleSort('total')} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider ml-auto">
                    Total <SortIcon col="total" />
                  </button>
                </th>
                <th className="text-center px-5 py-3">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mx-auto">
                    Status <SortIcon col="status" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="font-semibold text-gray-500">Tidak ada pesanan ditemukan</p>
                    <p className="text-gray-400 text-xs mt-1">Coba ubah filter pencarian</p>
                  </td>
                </tr>
              ) : (
                paginated.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs text-gray-400">{o.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{o.customerName}</td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{o.category}</td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{o.weightKg}kg</td>
                    <td className="px-3 py-3 text-right font-bold text-gray-800">{formatRupiah(o.total)}</td>
                    <td className="px-5 py-3 text-center"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
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
      <SlideOver
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Detail Pesanan"
      >
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
      <OrdersContent />
    </ToastProvider>
  )
}
