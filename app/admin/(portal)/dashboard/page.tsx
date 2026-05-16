'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  DollarSign,
  Clock,
  Truck,
  Plus,
  List,
  FileDown,
} from 'lucide-react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { MOCK_ORDERS } from '@/lib/mock-orders'
import { MOCK_TRANSACTIONS } from '@/lib/mock-transactions'
import { formatRupiah } from '@/lib/calculator'
import type { Order, Transaction } from '@/lib/types'
import StatsCard from '@/components/admin/shared/StatsCard'
import OrderStatusBadge from '@/components/admin/orders/OrderStatusBadge'

function getOrders(): Order[] {
  return storage.get<Order[]>(STORAGE_KEYS.ORDERS) ?? MOCK_ORDERS
}
function getTransactions(): Transaction[] {
  return storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) ?? MOCK_TRANSACTIONS
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function isLastMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
}

export default function DashboardPage() {
  const orders = useMemo(() => getOrders(), [])
  const transactions = useMemo(() => getTransactions(), [])

  const thisMonthOrders = orders.filter(o => isThisMonth(o.createdAt))
  const lastMonthOrders = orders.filter(o => isLastMonth(o.createdAt))
  const orderTrend = lastMonthOrders.length > 0
    ? (((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100).toFixed(0)
    : '0'

  const thisMonthIncome = transactions
    .filter(t => isThisMonth(t.date) && t.type === 'masuk')
    .reduce((sum, t) => sum + t.amount, 0)

  const waitingOrders = orders.filter(o => o.status === 'menunggu')
  const inProgressOrders = orders.filter(o => o.status === 'diproses' || o.status === 'dikirim')

  const last7Days = useMemo(() => {
    const days: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('id-ID', { weekday: 'short' })
      const count = orders.filter(o => {
        const od = new Date(o.createdAt)
        return od.toDateString() === d.toDateString()
      }).length
      days.push({ label, count })
    }
    return days
  }, [orders])

  const maxCount = Math.max(...last7Days.map(d => d.count), 1)
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas usaha jastip kamu</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/orders?new=1"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
          >
            <Plus size={15} />
            Tambah Pesanan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pesanan Bulan Ini"
          value={thisMonthOrders.length}
          icon={<Package size={18} className="text-blue-600" />}
          iconBg="bg-blue-100"
          trend={{ value: `${Math.abs(Number(orderTrend))}% vs bulan lalu`, up: Number(orderTrend) >= 0 }}
        />
        <StatsCard
          title="Total Pemasukan Bulan Ini"
          value={formatRupiah(thisMonthIncome)}
          icon={<DollarSign size={18} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Menunggu Konfirmasi"
          value={waitingOrders.length}
          icon={<Clock size={18} className="text-amber-600" />}
          iconBg="bg-amber-100"
          badge={waitingOrders.length > 0 ? { label: 'Perlu aksi', color: 'red' } : undefined}
        />
        <StatsCard
          title="Pesanan Dalam Proses"
          value={inProgressOrders.length}
          icon={<Truck size={18} className="text-violet-600" />}
          iconBg="bg-violet-100"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-black text-gray-900 text-sm mb-4">Pesanan 7 Hari Terakhir</h2>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map(d => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-semibold">{d.count}</span>
                <div
                  className="w-full rounded-t-lg bg-blue-500 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                />
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-sm">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-500">
              Lihat Semua →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-gray-400 text-sm">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">No. Pesanan</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Pelanggan</th>
                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3 hidden md:table-cell">Kategori</th>
                    <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Total</th>
                    <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{o.orderNumber}</td>
                      <td className="px-3 py-3 font-semibold text-gray-800">{o.customerName}</td>
                      <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{o.category}</td>
                      <td className="px-3 py-3 text-right font-bold text-gray-800">{formatRupiah(o.total)}</td>
                      <td className="px-5 py-3 text-center">
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/orders?new=1"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Plus size={15} className="text-blue-600" />
          Tambah Pesanan Manual
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <List size={15} className="text-gray-600" />
          Lihat Semua Pesanan
        </Link>
        <Link
          href="/admin/finance"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <FileDown size={15} className="text-green-600" />
          Export Laporan
        </Link>
      </div>
    </div>
  )
}
