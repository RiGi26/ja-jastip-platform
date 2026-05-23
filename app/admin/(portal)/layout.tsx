'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'

function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/admin/login')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080c14' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(232,48,58,0.15)', border: '1px solid rgba(232,48,58,0.25)' }}
          >
            🇯🇵
          </div>
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(79,70,229,0.25)', borderTopColor: '#4f46e5' }}
          />
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div
      className="flex h-screen overflow-hidden font-jakarta"
      style={{ background: '#f7f6f3' }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          style={{ background: '#f7f6f3' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AdminShell>{children}</AdminShell>
      </SettingsProvider>
    </AuthProvider>
  )
}
