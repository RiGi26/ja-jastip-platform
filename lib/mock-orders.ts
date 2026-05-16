import type { Order } from './types'
import { calculate } from './calculator'
import { RATES } from '@/constants/rates'

function makeOrder(
  id: string,
  num: string,
  daysAgo: number,
  name: string,
  wa: string,
  catIdx: number,
  svcIdx: number,
  weight: number,
  l: number,
  w: number,
  h: number,
  branded: boolean,
  fragile: boolean,
  status: Order['status'],
  notes = '',
): Order {
  const cat = RATES.CATEGORIES[catIdx]
  const svc = RATES.SERVICES[svcIdx]
  const result = calculate({
    weightKg: weight,
    lengthCm: l,
    widthCm: w,
    heightCm: h,
    categorySurcharge: cat.surcharge,
    serviceMultiplier: svc.multiplier,
    isBranded: branded,
    isFragile: fragile,
  })
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return {
    id,
    orderNumber: num,
    createdAt: date.toISOString(),
    customerName: name,
    customerWa: wa,
    category: cat.label,
    categorySurcharge: cat.surcharge,
    service: svc.label,
    serviceMultiplier: svc.multiplier,
    weightKg: weight,
    lengthCm: l,
    widthCm: w,
    heightCm: h,
    isBranded: branded,
    isFragile: fragile,
    notes,
    total: result.total,
    status,
  }
}

export const MOCK_ORDERS: Order[] = [
  makeOrder('ord_001', 'JA-2024-001', 2,  'Budi Santoso',        '+6281234567890', 0, 0, 3,   35, 25, 20, false, false, 'menunggu',    ''),
  makeOrder('ord_002', 'JA-2024-002', 4,  'Siti Rahayu',         '+6282345678901', 1, 0, 1.5, 20, 15, 10, false, false, 'dikonfirmasi','Harap dikemas rapi'),
  makeOrder('ord_003', 'JA-2024-003', 6,  'Ahmad Fauzi',         '+6283456789012', 2, 1, 2,   30, 20, 15, false, true,  'diproses',    'Barang elektronik sensitif'),
  makeOrder('ord_004', 'JA-2024-004', 8,  'Dewi Kusuma',         '+6284567890123', 3, 2, 0.8, 25, 20, 10, true,  false, 'dikirim',     'Luxury brand, perlu sertifikat'),
  makeOrder('ord_005', 'JA-2024-005', 10, 'Rizky Pratama',       '+6285678901234', 4, 0, 5,   40, 30, 25, false, false, 'selesai',     ''),
  makeOrder('ord_006', 'JA-2024-006', 12, 'Nadia Permata',       '+6286789012345', 5, 1, 2.5, 45, 35, 30, false, true,  'selesai',     'Figure anime limited edition'),
  makeOrder('ord_007', 'JA-2024-007', 14, 'Hendra Wijaya',       '+6287890123456', 0, 0, 1,   15, 10, 8,  false, false, 'dibatalkan',  'Pelanggan batalkan pesanan'),
  makeOrder('ord_008', 'JA-2024-008', 16, 'Fitri Handayani',     '+6288901234567', 1, 0, 2,   22, 18, 12, false, false, 'selesai',     ''),
  makeOrder('ord_009', 'JA-2024-009', 18, 'Eko Supriyanto',      '+6289012345678', 2, 2, 3,   35, 28, 20, false, false, 'dikirim',     ''),
  makeOrder('ord_010', 'JA-2024-010', 20, 'Lina Marlina',        '+6281123456789', 3, 1, 1.2, 30, 25, 15, true,  false, 'selesai',     'Pelanggan VIP'),
  makeOrder('ord_011', 'JA-2024-011', 22, 'Doni Kusumah',        '+6282234567890', 4, 0, 4,   50, 35, 30, false, false, 'selesai',     ''),
  makeOrder('ord_012', 'JA-2024-012', 24, 'Yuli Astuti',         '+6283345678901', 5, 0, 1.8, 40, 30, 25, false, true,  'dibatalkan',  'Stok habis di Jepang'),
  makeOrder('ord_013', 'JA-2024-013', 1,  'Wahyu Setiawan',      '+6284456789012', 0, 1, 2,   30, 22, 18, false, false, 'menunggu',    ''),
  makeOrder('ord_014', 'JA-2024-014', 3,  'Rini Wulandari',      '+6285567890123', 1, 0, 1,   18, 14, 10, false, false, 'dikonfirmasi','Warna biru'),
  makeOrder('ord_015', 'JA-2024-015', 5,  'Agus Hermawan',       '+6286678901234', 2, 2, 5,   45, 38, 32, true,  true,  'diproses',    'Kamera mirrorless + lensa'),
]
