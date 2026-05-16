'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Calculator,
  Users,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  ownerOnly?: boolean
  permission?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',         icon: <LayoutDashboard size={18} /> },
  { href: '/admin/orders',      label: 'Pesanan Masuk',     icon: <Package size={18} />,     permission: 'orders.view' },
  { href: '/admin/finance',     label: 'Keuangan',          icon: <DollarSign size={18} />,  ownerOnly: true },
  { href: '/admin/calculator',  label: 'Kalkulator Ongkir', icon: <Calculator size={18} />,  permission: 'calculator.use' },
  { href: '/admin/delegation',  label: 'Delegasi Admin',    icon: <Users size={18} />,       ownerOnly: true },
  { href: '/admin/settings',    label: 'Pengaturan Usaha',  icon: <Settings size={18} />,    ownerOnly: true },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const { session, isOwner, hasPermission } = useAuth()
  const { settings } = useSettings()

  function isVisible(item: NavItem): boolean {
    if (item.ownerOnly && !isOwner) return false
    if (item.permission && !isOwner) {
      return hasPermission(item.permission as Parameters<typeof hasPermission>[0])
    }
    return true
  }

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-700 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{settings.countryEmoji}</span>
            <span className="text-white font-black text-sm truncate">{settings.businessName}</span>
          </div>
        )}
        {collapsed && <span className="text-xl">{settings.countryEmoji}</span>}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const visible = isVisible(item)
          const active = isActive(item.href)

          if (!visible) return null

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`px-4 py-4 border-t border-slate-700 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed && (
          <>
            <p className="text-white text-xs font-bold truncate">{session?.name}</p>
            <p className="text-slate-500 text-xs mt-0.5 capitalize">{session?.role}</p>
            <p className="text-slate-600 text-[10px] mt-2">v1.0.0</p>
          </>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-black">
              {session?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
          />
          <aside className="relative flex flex-col w-64 bg-slate-900 border-r border-slate-700 z-50">
            <button
              onClick={onCloseMobile}
              aria-label="Tutup menu"
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
