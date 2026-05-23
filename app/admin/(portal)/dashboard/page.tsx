'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  DollarSign,
  Clock,
  Truck,
  Plus,
  ArrowRight,
  TrendingUp,
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
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-10 animate-fade-in">

      {/* ─── Page header (Apple Style) ─── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <p className="text-[12px] text-gray-500 mb-1.5 font-bold uppercase tracking-widest flex items-center gap-2 sf-display">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Operational Active • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="text-[40px] sf-display-heavy tracking-tight text-[#1D1D1F] leading-tight">
            Dashboard Jastip.
          </h1>
          <p className="text-sm text-gray-500 mt-1 sf-display">Ringkasan aktivitas dan performa bisnis Anda.</p>
        </div>
        <Link
          href="/admin/orders?new=1"
          className="bg-[#1D1D1F] text-white px-6 py-3 rounded-full text-sm sf-display-heavy shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah Pesanan
        </Link>
      </div>

      {/* ─── Stats Grid (Redesigned) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pesanan"
          value={thisMonthOrders.length}
          icon={<Package size={20} />}
          iconBg="bg-blue-50 text-apple-blue"
          trend={{ value: `${Math.abs(Number(orderTrend))}% vs bulan lalu`, up: Number(orderTrend) >= 0 }}
        />
        <StatsCard
          title="Income (Bulan Ini)"
          value={formatRupiah(thisMonthIncome)}
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Konfirmasi"
          value={waitingOrders.length}
          icon={<Clock size={20} />}
          iconBg="bg-orange-50 text-orange-600"
          badge={waitingOrders.length > 0 ? { label: 'Perlu aksi', color: 'red' } : undefined}
        />
        <StatsCard
          title="Dalam Proses"
          value={inProgressOrders.length}
          icon={<Truck size={20} />}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ─── Bar Chart (Modern) ─── */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-8 apple-shadow border border-black/[0.03]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[20px] sf-display-heavy tracking-tight text-[#1D1D1F]">
              Volume 7 Hari
            </h2>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-apple-blue uppercase tracking-widest">
              Pesanan
            </span>
          </div>

          <div className="relative pt-6">
            <div className="flex items-end gap-2 h-40">
              {last7Days.map((d, idx) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative bg-gray-50 rounded-2xl overflow-hidden" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-xl transition-all duration-700 bg-apple-blue shadow-[0_0_12px_rgba(0,113,227,0.3)] group-hover:bg-[#005BB5]"
                      style={{ height: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Recent Orders (Table-less Card style) ─── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[22px] sf-display-heavy tracking-tight text-[#1D1D1F]">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm sf-display text-apple-blue hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center apple-shadow border border-black/[0.03]">
              <Package size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 sf-display">Belum ada pesanan terbaru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(o => (
                <div
                  key={o.id}
                  className="bg-white rounded-[24px] p-5 apple-shadow apple-shadow-hover border border-black/[0.02] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-[#1D1D1F] shrink-0 border border-black/[0.03] group-hover:scale-105 transition-transform">
                        <span className="text-[9px] font-bold uppercase text-gray-400">Order</span>
                        <span className="text-sm font-mono font-bold">#{o.orderNumber.slice(-3)}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="sf-display text-[17px] text-[#1D1D1F] truncate">{o.customerName}</p>
                        <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                            <span>{o.category}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-apple-blue">{formatRupiah(o.total)}</span>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                      <OrderStatusBadge status={o.status} />
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-apple-blue group-hover:text-white transition-colors">
                          <ArrowRight size={18} />
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
