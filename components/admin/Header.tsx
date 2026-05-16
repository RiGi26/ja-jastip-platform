'use client'

import { Menu, LogOut, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

interface HeaderProps {
  onOpenMobile: () => void
}

export default function Header({ onOpenMobile }: HeaderProps) {
  const { session, logout } = useAuth()
  const { settings } = useSettings()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="font-black text-gray-900 text-sm hidden sm:block">
          {settings.businessName}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Lihat halaman publik"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ExternalLink size={14} />
          Halaman Publik
        </a>

        {/* Avatar + user info */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">
              {session?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-gray-800 leading-none">{session?.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{session?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          aria-label="Keluar dari portal"
          title="Logout"
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
