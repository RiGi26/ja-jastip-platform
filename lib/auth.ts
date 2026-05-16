import { storage, STORAGE_KEYS } from './storage'
import type { Session, AdminUser, PermissionKey, UserRole } from './types'
import { MOCK_USERS } from './mock-users'

export function getUsers(): AdminUser[] {
  return storage.get<AdminUser[]>(STORAGE_KEYS.USERS) ?? MOCK_USERS
}

export function saveUsers(users: AdminUser[]): void {
  storage.set(STORAGE_KEYS.USERS, users)
}

export function getSession(): Session | null {
  return storage.get<Session>(STORAGE_KEYS.SESSION)
}

export function setSession(session: Session): void {
  storage.set(STORAGE_KEYS.SESSION, session)
}

export function clearSession(): void {
  storage.remove(STORAGE_KEYS.SESSION)
}

export function login(username: string, password: string): Session | null {
  const users = getUsers()
  const user = users.find(
    u => u.username === username && u.passwordHash === btoa(password) && u.isActive,
  )
  if (!user) return null
  const session: Session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  }
  setSession(session)
  return session
}

export function hasPermission(session: Session | null, key: PermissionKey): boolean {
  if (!session) return false
  if (session.role === 'owner') return true
  return session.permissions.includes(key)
}

export function isOwner(session: Session | null): boolean {
  return session?.role === 'owner'
}

export function refreshSessionPermissions(userId: string): void {
  const session = getSession()
  if (!session || session.userId !== userId) return
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) return
  setSession({ ...session, permissions: user.permissions })
}

export function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function isValidRole(role: string): role is UserRole {
  return role === 'owner' || role === 'admin'
}
