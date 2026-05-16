import type { Transaction } from './types'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx_001',
    date: daysAgo(10),
    orderId: 'ord_005',
    orderNumber: 'JA-2024-005',
    customerName: 'Rizky Pratama',
    category: 'Snack / Makanan',
    amount: 795000,
    type: 'masuk',
    description: 'Pelunasan pesanan JA-2024-005',
  },
  {
    id: 'trx_002',
    date: daysAgo(12),
    orderId: 'ord_006',
    orderNumber: 'JA-2024-006',
    customerName: 'Nadia Permata',
    category: 'Figure / Anime Goods',
    amount: 617500,
    type: 'masuk',
    description: 'Pelunasan pesanan JA-2024-006',
  },
  {
    id: 'trx_003',
    date: daysAgo(14),
    orderId: 'ord_008',
    orderNumber: 'JA-2024-008',
    customerName: 'Fitri Handayani',
    category: 'Skincare Jepang',
    amount: 370500,
    type: 'masuk',
    description: 'Pelunasan pesanan JA-2024-008',
  },
  {
    id: 'trx_004',
    date: daysAgo(20),
    orderId: 'ord_010',
    orderNumber: 'JA-2024-010',
    customerName: 'Lina Marlina',
    category: 'Luxury Brand',
    amount: 604500,
    type: 'masuk',
    description: 'Pelunasan pesanan JA-2024-010',
  },
  {
    id: 'trx_005',
    date: daysAgo(22),
    orderId: 'ord_011',
    orderNumber: 'JA-2024-011',
    customerName: 'Doni Kusumah',
    category: 'Snack / Makanan',
    amount: 795000,
    type: 'masuk',
    description: 'Pelunasan pesanan JA-2024-011',
  },
  {
    id: 'trx_006',
    date: daysAgo(15),
    amount: 250000,
    type: 'keluar',
    description: 'Biaya packaging & perlengkapan bulan ini',
  },
  {
    id: 'trx_007',
    date: daysAgo(18),
    amount: 150000,
    type: 'keluar',
    description: 'Biaya administrasi & operasional',
  },
  {
    id: 'trx_008',
    date: daysAgo(5),
    orderId: 'ord_004',
    orderNumber: 'JA-2024-004',
    customerName: 'Dewi Kusuma',
    category: 'Luxury Brand',
    amount: 512000,
    type: 'masuk',
    description: 'DP pesanan JA-2024-004',
  },
  {
    id: 'trx_009',
    date: daysAgo(8),
    amount: 500000,
    type: 'masuk',
    description: 'Komisi referral dari mitra',
  },
  {
    id: 'trx_010',
    date: daysAgo(25),
    amount: 300000,
    type: 'keluar',
    description: 'Biaya pengiriman domestik batch lama',
  },
]
