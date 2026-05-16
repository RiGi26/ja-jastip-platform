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

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Header info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-gray-400">{order.orderNumber}</p>
          <h3 className="font-black text-gray-900 text-lg">{order.customerName}</h3>
          <p className="text-sm text-gray-500">{order.customerWa}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Detail rows */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
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
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
        {order.notes && (
          <div className="pt-2 border-t border-gray-200">
            <span className="text-gray-500 block text-xs mb-1">Catatan</span>
            <span className="text-gray-700">{order.notes}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-bold text-blue-600">Total Pembayaran</span>
        <span className="text-xl font-black text-blue-700">{formatRupiah(order.total)}</span>
      </div>

      {/* Change status */}
      {canChangeStatus && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ubah Status Pesanan</p>
          <select
            value={order.status}
            onChange={e => setConfirmStatus(e.target.value as OrderStatus)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-colors"
        >
          <MessageCircle size={15} />
          Kirim WA
        </a>
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          aria-label="Hapus pesanan"
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
