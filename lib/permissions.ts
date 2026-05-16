import type { PermissionKey } from './types'

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'orders.view': 'Lihat & Kelola Pesanan Masuk',
  'orders.changeStatus': 'Ubah Status Pesanan',
  'orders.create': 'Tambah Pesanan Manual',
  'orders.export': 'Export Data Pesanan',
  'calculator.use': 'Akses Kalkulator Ongkir',
}

export const ALL_PERMISSIONS: PermissionKey[] = [
  'orders.view',
  'orders.changeStatus',
  'orders.create',
  'orders.export',
  'calculator.use',
]
