'use client'

import { Menu, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard':   'Dashboard',
  '/admin/orders':      'Pesanan Masuk',
  '/admin/calculator':  'Kalkulator Ongkir',
  '/admin/finance':     'Keuangan',
  '/admin/delegation':  'Delegasi Admin',
  '/admin/settings':    'Pengaturan Usaha',
}

interface HeaderProps {
  onOpenMobile: () => void
}

export default function Header({ onOpenMobile }: HeaderProps) {
  const { session, logout } = useAuth()
  const { settings } = useSettings()
  const pathname = usePathname()

  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin Portal'
  const initials = session?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
      style={{
        height: '72px',
        background: '#fdfcfb',
        borderBottom: '1px solid #ece9e3',
      }}
    >
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: '#9c9690' }}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs font-semibold" style={{ color: '#9c9690' }}>
            {settings.businessName}
          </span>
          <span className="hidden sm:block text-xs" style={{ color: '#c8c3bc' }}>/</span>
          <span className="font-bold text-sm" style={{ color: '#100e0b' }}>
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Lihat halaman publik"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ color: '#9c9690', borderRadius: '10px' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f0ede8'
            e.currentTarget.style.color = '#6b6560'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#9c9690'
          }}
        >
          <ExternalLink size={13} />
          Halaman Publik
        </a>

        {/* User badge */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
          style={{ background: '#f7f6f3', border: '1px solid #e8e4de' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
            style={{ background: 'rgba(79,70,229,0.12)', color: '#4f46e5' }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold leading-none" style={{ color: '#100e0b' }}>{session?.name}</p>
            <p
              className="text-[9px] mt-0.5 capitalize font-bold px-1.5 py-0.5 rounded inline-block leading-none"
              style={{
                background: session?.role === 'owner' ? 'rgba(232,48,58,0.10)' : 'rgba(79,70,229,0.10)',
                color:      session?.role === 'owner' ? '#e8303a' : '#6366f1',
              }}
            >
              {session?.role}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          aria-label="Keluar dari portal"
          title="Logout"
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#9c9690', borderRadius: '10px' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fee2e2'
            e.currentTarget.style.color = '#dc2626'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#9c9690'
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
