export type PermissionKey =
  | 'orders.view'
  | 'orders.changeStatus'
  | 'orders.create'
  | 'orders.export'
  | 'calculator.use'

export type UserRole = 'owner' | 'admin'

export interface AdminUser {
  id: string
  name: string
  username: string
  passwordHash: string
  role: UserRole
  permissions: PermissionKey[]
  isActive: boolean
  createdAt: string
  notes?: string
}

export interface Session {
  userId: string
  username: string
  name: string
  role: UserRole
  permissions: PermissionKey[]
}

export type OrderStatus =
  | 'menunggu'
  | 'dikonfirmasi'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan'

export interface Order {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  customerWa: string
  category: string
  categorySurcharge: number
  service: string
  serviceMultiplier: number
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isBranded: boolean
  isFragile: boolean
  notes: string
  total: number
  status: OrderStatus
}

export type TransactionType = 'masuk' | 'keluar'

export interface Transaction {
  id: string
  date: string
  orderId?: string
  orderNumber?: string
  customerName?: string
  category?: string
  amount: number
  type: TransactionType
  description: string
}

export interface BusinessSettings {
  businessName: string
  tagline: string
  waNumber: string
  originCountry: string
  originCurrency: string
  countryEmoji: string
  primaryColor: string
  accentColor: string
}

export interface RateSettings {
  basePerKg: number
  volumeDivisor: number
  volumePerKg: number
  insuranceHandling: number
  brandedFee: number
  fragileFee: number
  categories: { label: string; surcharge: number }[]
  services: { label: string; multiplier: number }[]
}

export interface CalcHistoryItem {
  id: string
  savedAt: string
  input: {
    weightKg: number
    lengthCm: number
    widthCm: number
    heightCm: number
    category: string
    service: string
    isBranded: boolean
    isFragile: boolean
  }
  total: number
}

export interface PermissionChangeLog {
  changedAt: string
  changedBy: string
  targetUserId: string
  previousPermissions: PermissionKey[]
  newPermissions: PermissionKey[]
}
