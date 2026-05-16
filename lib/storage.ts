export const storage = {
  get: <T>(key: string): T | null => {
    try {
      if (typeof window === 'undefined') return null
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('localStorage tidak tersedia')
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch {
      console.error('localStorage tidak tersedia')
    }
  },
}

export const STORAGE_KEYS = {
  SESSION: 'jastip_session',
  USERS: 'jastip_users',
  ORDERS: 'jastip_orders',
  TRANSACTIONS: 'jastip_transactions',
  SETTINGS: 'jastip_settings',
  RATE_SETTINGS: 'jastip_rate_settings',
  CALC_HISTORY: 'jastip_calc_history',
  PERMISSION_LOG: 'jastip_permission_log',
} as const
