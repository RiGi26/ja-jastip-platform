import type { OrderStatus } from '@/lib/types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  menunggu:     'bg-amber-100 text-amber-700',
  dikonfirmasi: 'bg-blue-100 text-blue-700',
  diproses:     'bg-violet-100 text-violet-700',
  dikirim:      'bg-orange-100 text-orange-700',
  selesai:      'bg-green-100 text-green-700',
  dibatalkan:   'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu:     'Menunggu',
  dikonfirmasi: 'Dikonfirmasi',
  diproses:     'Diproses',
  dikirim:      'Dikirim',
  selesai:      'Selesai',
  dibatalkan:   'Dibatalkan',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export { STATUS_LABELS }
