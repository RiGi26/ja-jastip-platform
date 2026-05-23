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
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',         icon: <LayoutDashboard size={16} />, group: 'main' },
  { href: '/admin/orders',      label: 'Pesanan Masuk',     icon: <Package size={16} />,          group: 'main', permission: 'orders.view' },
  { href: '/admin/calculator',  label: 'Kalkulator Ongkir', icon: <Calculator size={16} />,       group: 'main', permission: 'calculator.use' },
  { href: '/admin/finance',     label: 'Keuangan',          icon: <DollarSign size={16} />,       group: 'ops',  ownerOnly: true },
  { href: '/admin/delegation',  label: 'Delegasi Admin',    icon: <Users size={16} />,            group: 'ops',  ownerOnly: true },
  { href: '/admin/settings',    label: 'Pengaturan Usaha',  icon: <Settings size={16} />,         group: 'ops',  ownerOnly: true },
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

  const visibleItems = NAV_ITEMS.filter(isVisible)
  const mainItems = visibleItems.filter(i => i.group === 'main')
  const opsItems  = visibleItems.filter(i => i.group === 'ops')

  const initials = session?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Logo / wordmark ── */}
      <div
        className={`flex items-center h-[72px] px-4 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid #141b2d' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: 'rgba(232,48,58,0.15)', border: '1px solid rgba(232,48,58,0.25)' }}
            >
              {settings.countryEmoji}
            </div>
            <div className="min-w-0">
              <p className="text-white font-extrabold text-sm leading-tight truncate tracking-tight">
                {settings.businessName}
              </p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: '#e8303a', fontWeight: 700, letterSpacing: '0.04em' }}>
                ADMIN PORTAL
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'rgba(232,48,58,0.15)', border: '1px solid rgba(232,48,58,0.25)' }}
          >
            {settings.countryEmoji}
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-colors"
          style={{ color: '#7a8599' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f0f4ff'
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#7a8599'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto sidebar-scroll space-y-0.5">

        {mainItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              style={active ? {
                background: 'rgba(232, 48, 58, 0.10)',
                color: '#f0f4ff',
                borderLeft: '3px solid #e8303a',
              } : {
                borderLeft: '3px solid transparent',
                color: '#7a8599',
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-semibold transition-all duration-150
                ${collapsed ? 'justify-center' : ''}
              `}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.04)'
                  el.style.color = '#c8d0e0'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'transparent'
                  el.style.color = '#7a8599'
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {opsItems.length > 0 && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#3d4761' }}>
                  Operasional
                </p>
              </div>
            )}
            {collapsed && <div className="my-3 mx-2" style={{ borderTop: '1px solid #141b2d' }} />}

            {opsItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  style={active ? {
                    background: 'rgba(232, 48, 58, 0.10)',
                    color: '#f0f4ff',
                    borderLeft: '3px solid #e8303a',
                  } : {
                    borderLeft: '3px solid transparent',
                    color: '#7a8599',
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-semibold transition-all duration-150
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  onMouseEnter={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'rgba(255,255,255,0.04)'
                      el.style.color = '#c8d0e0'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.color = '#7a8599'
                    }
                  }}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* ── Footer ── */}
      <div
        className={`flex-shrink-0 px-3 py-4 ${collapsed ? 'items-center justify-center flex flex-col' : ''}`}
        style={{ borderTop: '1px solid #141b2d' }}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
              style={{ background: 'rgba(232,48,58,0.15)', border: '1px solid rgba(232,48,58,0.25)', color: '#e8303a' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold leading-tight truncate">{session?.name}</p>
              <p
                className="text-[10px] mt-0.5 capitalize font-semibold px-1.5 py-0.5 rounded inline-block"
                style={{
                  background: session?.role === 'owner' ? 'rgba(232,48,58,0.12)' : 'rgba(79,70,229,0.12)',
                  color: session?.role === 'owner' ? '#e8303a' : '#818cf8',
                }}
              >
                {session?.role}
              </p>
            </div>
            <p className="text-[9px] flex-shrink-0" style={{ color: '#3d4761' }}>v1.0</p>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold"
            style={{ background: 'rgba(232,48,58,0.15)', border: '1px solid rgba(232,48,58,0.25)', color: '#e8303a' }}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300`}
        style={{
          width: collapsed ? '64px' : '240px',
          background: '#080c14',
          borderRight: '1px solid #141b2d',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onCloseMobile}
          />
          <aside
            className="relative flex flex-col w-60 z-50"
            style={{ background: '#080c14', borderRight: '1px solid #141b2d' }}
          >
            <button
              onClick={onCloseMobile}
              aria-label="Tutup menu"
              className="absolute top-5 right-4 p-1 rounded-md transition-colors"
              style={{ color: '#7a8599' }}
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
