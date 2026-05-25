'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession, login as doLogin, hasPermission as checkPermission } from '@/lib/auth'
import type { Session, PermissionKey } from '@/lib/types'

interface AuthContextValue {
  session: Session | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  hasPermission: (key: PermissionKey) => boolean
  isOwner: boolean
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshSession = useCallback(() => {
    const s = getSession()
    setSession(s)
  }, [])

  useEffect(() => {
    refreshSession()
    setIsLoading(false)
  }, [refreshSession])

  const login = useCallback(
    async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const s = doLogin(username, password)
      if (!s) return { ok: false, error: 'Username atau password salah' }
      
      // Menggunakan Session Cookie (tanpa max-age) agar otomatis terhapus saat browser ditutup
      document.cookie = `jastip_auth=1; path=/; samesite=strict`
      
      setSession(s)
      return { ok: true }
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    document.cookie = 'jastip_auth=; path=/; max-age=0'
    setSession(null)
    router.push('/admin/login')
  }, [router])

  const hasPermission = useCallback(
    (key: PermissionKey) => checkPermission(session, key),
    [session],
  )

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        hasPermission,
        isOwner: session?.role === 'owner',
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan dalam AuthProvider')
  return ctx
}

export function usePermission(key: PermissionKey): boolean {
  const { hasPermission } = useAuth()
  return hasPermission(key)
}
