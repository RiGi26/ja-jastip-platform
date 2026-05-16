import type { Order, Transaction } from './types'

function toCsvRow(cells: (string | number)[]): string {
  return cells
    .map(c => `"${String(c).replace(/"/g, '""')}"`)
    .join(',')
}

export function exportOrdersCsv(orders: Order[]): void {
  const header = toCsvRow(['No', 'Tanggal', 'Nama', 'WA', 'Kategori', 'Berat (kg)', 'Total', 'Status'])
  const rows = orders.map((o, i) =>
    toCsvRow([
      i + 1,
      new Date(o.createdAt).toLocaleDateString('id-ID'),
      o.customerName,
      o.customerWa,
      o.category,
      o.weightKg,
      o.total,
      o.status,
    ]),
  )
  downloadCsv([header, ...rows].join('\n'), `pesanan-${Date.now()}.csv`)
}

export function exportTransactionsCsv(transactions: Transaction[]): void {
  const header = toCsvRow(['No', 'Tanggal', 'No. Pesanan', 'Nama', 'Kategori', 'Nominal', 'Tipe', 'Keterangan'])
  const rows = transactions.map((t, i) =>
    toCsvRow([
      i + 1,
      new Date(t.date).toLocaleDateString('id-ID'),
      t.orderNumber ?? '-',
      t.customerName ?? '-',
      t.category ?? '-',
      t.amount,
      t.type,
      t.description,
    ]),
  )
  downloadCsv([header, ...rows].join('\n'), `transaksi-${Date.now()}.csv`)
}

function downloadCsv(content: string, filename: string): void {
  const bom = '﻿'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
