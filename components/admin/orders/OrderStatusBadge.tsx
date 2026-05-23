import type { OrderStatus } from '@/lib/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  menunggu:     { label: 'Menunggu',     color: '#b45309', bg: 'rgba(217,119,6,0.10)',    dot: '#d97706' },
  dikonfirmasi: { label: 'Dikonfirmasi', color: '#4338ca', bg: 'rgba(79,70,229,0.10)',    dot: '#4f46e5' },
  diproses:     { label: 'Diproses',     color: '#6d28d9', bg: 'rgba(124,58,237,0.10)',   dot: '#7c3aed' },
  dikirim:      { label: 'Dikirim',      color: '#c2410c', bg: 'rgba(234,88,12,0.10)',    dot: '#ea580c' },
  selesai:      { label: 'Selesai',      color: '#15803d', bg: 'rgba(22,163,74,0.10)',    dot: '#16a34a' },
  dibatalkan:   { label: 'Dibatalkan',   color: '#b91c1c', bg: 'rgba(220,38,38,0.10)',    dot: '#dc2626' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

export const STATUS_LABELS: Record<OrderStatus, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])
) as Record<OrderStatus, string>
