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
  ArrowRight,
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
    <div className="space-y-6 font-jakarta">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
            Ringkasan aktivitas usaha jastip kamu
          </p>
        </div>
        <Link
          href="/admin/orders?new=1"
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
          <Plus size={15} />
          Tambah Pesanan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pesanan Bulan Ini"
          value={thisMonthOrders.length}
          icon={<Package size={16} style={{ color: '#4f46e5' }} />}
          iconBg="bg-indigo-100"
          accent="indigo"
          trend={{ value: `${Math.abs(Number(orderTrend))}% vs bulan lalu`, up: Number(orderTrend) >= 0 }}
        />
        <StatsCard
          title="Pemasukan Bulan Ini"
          value={formatRupiah(thisMonthIncome)}
          icon={<DollarSign size={16} style={{ color: '#16a34a' }} />}
          iconBg="bg-green-100"
          accent="green"
        />
        <StatsCard
          title="Menunggu Konfirmasi"
          value={waitingOrders.length}
          icon={<Clock size={16} style={{ color: '#d97706' }} />}
          iconBg="bg-amber-100"
          accent="amber"
          badge={waitingOrders.length > 0 ? { label: 'Perlu aksi', color: 'red' } : undefined}
        />
        <StatsCard
          title="Pesanan Dalam Proses"
          value={inProgressOrders.length}
          icon={<Truck size={16} style={{ color: '#7c3aed' }} />}
          iconBg="bg-violet-100"
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <div
          className="xl:col-span-1 rounded-2xl p-5"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
              7 Hari Terakhir
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              Pesanan
            </span>
          </div>

          {/* Chart area */}
          <div className="relative">
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-0 h-32 flex flex-col justify-between pointer-events-none">
              {[maxCount, Math.ceil(maxCount * 0.75), Math.ceil(maxCount * 0.5), Math.ceil(maxCount * 0.25), 0].map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="text-[9px] w-4 text-right flex-shrink-0 font-mono"
                    style={{ color: '#c8c3bc' }}
                  >
                    {v}
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: '#f0ede8' }} />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-1.5 h-32 pl-6 pb-0">
              {last7Days.map((d, idx) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  {d.count > 0 && (
                    <span
                      className="text-[9px] font-bold font-mono"
                      style={{ color: '#4f46e5' }}
                    >
                      {d.count}
                    </span>
                  )}
                  <div className="w-full relative" style={{ height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${(d.count / maxCount) * 80}%`,
                        minHeight: d.count > 0 ? '6px' : '2px',
                        background: d.count > 0
                          ? `linear-gradient(to top, #4338ca, #6366f1)`
                          : '#f0ede8',
                        animationDelay: `${idx * 60}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day labels */}
          <div className="flex gap-1.5 pl-6 mt-2">
            {last7Days.map(d => (
              <div key={d.label} className="flex-1 text-center">
                <span className="text-[10px] font-semibold" style={{ color: '#9c9690' }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div
          className="xl:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #f0ede8' }}
          >
            <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold transition-colors"
              style={{ color: '#4f46e5' }}
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm font-semibold" style={{ color: '#9c9690' }}>Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f7f6f3' }}>
                    <th className="text-left px-5 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        No. Pesanan
                      </span>
                    </th>
                    <th className="text-left px-3 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        Pelanggan
                      </span>
                    </th>
                    <th className="text-left px-3 py-3 hidden md:table-cell">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        Kategori
                      </span>
                    </th>
                    <th className="text-right px-3 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        Total
                      </span>
                    </th>
                    <th className="text-center px-5 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                        Status
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr
                      key={o.id}
                      className="table-row-hover transition-colors"
                      style={{ borderBottom: '1px solid #faf9f7' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <td className="px-5 py-3">
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{ color: '#6b6560' }}
                        >
                          {o.orderNumber}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-sm" style={{ color: '#100e0b' }}>
                        {o.customerName}
                      </td>
                      <td className="px-3 py-3 text-sm hidden md:table-cell" style={{ color: '#9c9690' }}>
                        {o.category}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/admin/orders?new=1', icon: <Plus size={14} style={{ color: '#4f46e5' }} />, label: 'Tambah Pesanan Manual' },
          { href: '/admin/orders',       icon: <List size={14} style={{ color: '#6b6560' }} />, label: 'Lihat Semua Pesanan' },
          { href: '/admin/finance',      icon: <FileDown size={14} style={{ color: '#16a34a' }} />, label: 'Export Laporan' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: '#ffffff',
              border: '1px solid #e8e4de',
              color: '#6b6560',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f7f6f3'
              e.currentTarget.style.borderColor = '#ddd9d3'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = '#e8e4de'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
