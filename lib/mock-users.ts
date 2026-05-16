import type { AdminUser } from './types'

export const MOCK_USERS: AdminUser[] = [
  {
    id: 'usr_001',
    name: 'Owner JapanArena',
    username: 'owner',
    passwordHash: btoa('admin123'),
    role: 'owner',
    permissions: [
      'orders.view',
      'orders.changeStatus',
      'orders.create',
      'orders.export',
      'calculator.use',
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    notes: 'Akun utama pemilik usaha',
  },
  {
    id: 'usr_002',
    name: 'Admin Satu',
    username: 'admin1',
    passwordHash: btoa('admin123'),
    role: 'admin',
    permissions: [
      'orders.view',
      'orders.changeStatus',
      'orders.create',
      'calculator.use',
    ],
    isActive: true,
    createdAt: '2024-02-15T00:00:00.000Z',
    notes: 'Sub-admin untuk pengelolaan pesanan harian',
  },
]
