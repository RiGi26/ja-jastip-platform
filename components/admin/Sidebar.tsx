'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
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
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  ownerOnly?: boolean
  permission?: string
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',         icon: <LayoutDashboard size={18} />, group: 'main' },
  { href: '/admin/orders',      label: 'Pesanan Masuk',     icon: <Package size={18} />,          group: 'main', permission: 'orders.view' },
  { href: '/admin/calculator',  label: 'Kalkulator Ongkir', icon: <Calculator size={18} />,       group: 'main', permission: 'calculator.use' },
  { href: '/admin/finance',     label: 'Keuangan',          icon: <DollarSign size={18} />,       group: 'ops',  ownerOnly: true },
  { href: '/admin/delegation',  label: 'Delegasi Admin',    icon: <Users size={18} />,            group: 'ops',  ownerOnly: true },
  { href: '/admin/settings',    label: 'Pengaturan Usaha',  icon: <Settings size={18} />,         group: 'ops',  ownerOnly: true },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const { session, isOwner, hasPermission, logout } = useAuth()
  const { settings } = useSettings()

  function isVisible(item: NavItem): boolean {
    if (item.ownerOnly && !isOwner) return false
    if (item.permission && !isOwner) {
      return hasPermission(item.permission as any)
    }
    return true
  }

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const visibleItems = NAV_ITEMS.filter(isVisible)
  const mainItems = visibleItems.filter(i => i.group === 'main')
  const opsItems  = visibleItems.filter(i => i.group === 'ops')

  const initials = session?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo Section (Apple Style) ── */}
      <div
        className={`flex flex-col shrink-0 items-center justify-center border-b border-black/5 px-4 transition-all duration-300 ${collapsed ? 'h-16 py-3' : 'h-28 py-5'}`}
      >
        <img
          src="/logo-rocket.png"
          alt="Logo Webzoka"
          className={`w-auto shrink-0 object-contain transition-all duration-300 ${collapsed ? 'h-8' : 'h-10'}`}
        />
        {!collapsed && (
          <div className="min-w-0 animate-fade-in select-none text-center mt-2.5">
            <p className="truncate text-sm font-bold tracking-tight text-gray-900">Jastip Portal</p>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">Portal Operasi</p>
          </div>
        )}
      </div>   <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-10 bg-white border border-black/10 rounded-full p-1.5 shadow-sm text-gray-400 hover:text-black hover:shadow-md z-30 transform transition-all hover:scale-110"
        >
          {collapsed ? <ChevronRight size={14} strokeWidth={2.5}/> : <ChevronLeft size={14} strokeWidth={2.5}/>}
        </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hide space-y-1.5">
        <p className={`px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Main Menu
        </p>

        {mainItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-sm sf-display relative overflow-hidden transition-colors
                ${active 
                  ? 'bg-[#0071E3]/10 text-[#0071E3] font-bold' 
                  : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}
              `}
            >
              {active && <div className="absolute left-0 top-[15%] h-[70%] w-[3px] bg-[#0071E3] rounded-r-md"></div>}
              <div className={`${collapsed ? '' : 'w-6'} flex justify-center shrink-0`}>
                <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
              </div>
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Link>
          )
        })}

        {opsItems.length > 0 && (
          <div className="pt-4">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Operasional
              </p>
            )}
            <div className="space-y-1.5">
              {opsItems.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center ${collapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-sm sf-display relative overflow-hidden transition-colors
                      ${active 
                        ? 'bg-[#0071E3]/10 text-[#0071E3] font-bold' 
                        : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}
                    `}
                  >
                    {active && <div className="absolute left-0 top-[15%] h-[70%] w-[3px] bg-[#0071E3] rounded-r-md"></div>}
                    <div className={`${collapsed ? '' : 'w-6'} flex justify-center shrink-0`}>
                      <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
                    </div>
                    {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-black/5 bg-white/50 shrink-0">
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''} p-2 hover:bg-black/5 rounded-xl transition-colors relative mb-2`}>
          <div className="w-10 h-10 rounded-full bg-white border border-black/10 overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 font-bold text-xs text-gray-600">
             {initials}
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-[14px] sf-display truncate text-gray-900">{session?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <p className="text-[11px] text-gray-500 font-medium truncate uppercase">{session?.role}</p>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={logout}
          className={`flex items-center justify-center gap-2 w-full py-2 bg-[#FF3B30]/10 text-[#FF3B30] text-[11px] font-bold rounded-lg hover:bg-[#FF3B30]/20 transition-colors ${collapsed ? 'px-0' : 'px-4'}`}
          title={collapsed ? 'Keluar' : undefined}
        >
          <LogOut size={14} />
          {!collapsed && <span>Keluar Sistem</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 apple-glass border-r border-black/5 z-50`}
        style={{ width: collapsed ? '80px' : '256px' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={onCloseMobile} />
          <aside className="relative flex flex-col w-64 h-full apple-glass border-r border-black/5 z-50 animate-slide-right">
            <button onClick={onCloseMobile} className="absolute top-6 right-4 p-2 text-gray-400 hover:text-black">
              <X size={22} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
