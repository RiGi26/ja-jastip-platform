'use client'

import { useState } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import { formatRupiah } from '@/lib/calculator'
import type { Order, OrderStatus } from '@/lib/types'
import OrderStatusBadge, { STATUS_LABELS } from './OrderStatusBadge'
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog'
import { usePermission } from '@/contexts/AuthContext'

const ALL_STATUSES: OrderStatus[] = ['menunggu', 'dikonfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan']

interface OrderDetailProps {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
  onDelete: (id: string) => void
}

export default function OrderDetail({ order, onStatusChange, onDelete }: OrderDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<OrderStatus | null>(null)
  const canChangeStatus = usePermission('orders.changeStatus')

  const waMsg = `Halo ${order.customerName}! 👋\n\nUpdate pesanan kamu:\n📦 No. Pesanan: ${order.orderNumber}\n📦 Kategori: ${order.category}\n⚖️ Berat: ${order.weightKg}kg\n🚚 Layanan: ${order.service}\n💰 Total: ${formatRupiah(order.total)}\n📍 Status: ${STATUS_LABELS[order.status]}\n\nTerima kasih sudah mempercayai kami! 🙏`
  const waUrl = `https://wa.me/${order.customerWa.replace('+', '')}?text=${encodeURIComponent(waMsg)}`

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
    appearance: 'none',
  }

  return (
    <div className="px-6 py-5 space-y-5 font-jakarta">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold" style={{ color: '#9c9690' }}>
            {order.orderNumber}
          </p>
          <h3 className="font-extrabold text-lg tracking-tight mt-0.5" style={{ color: '#100e0b' }}>
            {order.customerName}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>{order.customerWa}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Detail rows */}
      <div
        className="rounded-xl p-4 space-y-2.5 text-sm"
        style={{ background: '#faf9f7', border: '1px solid #f0ede8' }}
      >
        {[
          ['Tanggal Order', new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
          ['Kategori', order.category],
          ['Layanan', order.service],
          ['Berat', `${order.weightKg} kg`],
          ['Dimensi', `${order.lengthCm} × ${order.widthCm} × ${order.heightCm} cm`],
          ['Branded', order.isBranded ? 'Ya' : 'Tidak'],
          ['Fragile', order.isFragile ? 'Ya' : 'Tidak'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span style={{ color: '#9c9690' }}>{label}</span>
            <span className="font-semibold" style={{ color: '#100e0b' }}>{value}</span>
          </div>
        ))}
        {order.notes && (
          <div className="pt-2" style={{ borderTop: '1px solid #e8e4de' }}>
            <span className="block text-xs mb-1" style={{ color: '#9c9690' }}>Catatan</span>
            <span style={{ color: '#6b6560' }}>{order.notes}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div
        className="px-4 py-3 rounded-xl flex justify-between items-center"
        style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)' }}
      >
        <span className="text-sm font-bold" style={{ color: '#4f46e5' }}>Total Pembayaran</span>
        <span className="font-mono font-black text-xl" style={{ color: '#3730a3' }}>
          {formatRupiah(order.total)}
        </span>
      </div>

      {/* Change status */}
      {canChangeStatus && (
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: '#9c9690' }}
          >
            Ubah Status Pesanan
          </p>
          <select
            value={order.status}
            onChange={e => setConfirmStatus(e.target.value as OrderStatus)}
            style={inputStyle}
            onFocus={e => {
              e.target.style.borderColor = '#4f46e5'
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#ddd9d3'
              e.target.style.boxShadow = 'none'
            }}
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: '#16a34a' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#15803d'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#16a34a'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}
        >
          <MessageCircle size={15} />
          Kirim WA
        </a>
        <button
          onClick={() => setConfirmDelete(true)}
          aria-label="Hapus pesanan"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <ConfirmDialog
        open={!!confirmStatus}
        title="Ubah Status Pesanan"
        message={`Ubah status pesanan ${order.orderNumber} menjadi "${confirmStatus ? STATUS_LABELS[confirmStatus] : ''}"?`}
        onConfirm={() => {
          if (confirmStatus) onStatusChange(order.id, confirmStatus)
          setConfirmStatus(null)
        }}
        onCancel={() => setConfirmStatus(null)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus Pesanan"
        message={`Hapus pesanan ${order.orderNumber} dari ${order.customerName}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => { onDelete(order.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
