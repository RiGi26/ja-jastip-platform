import type { ReactNode } from 'react'

type AccentColor = 'indigo' | 'green' | 'amber' | 'red' | 'violet' | 'blue'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBg?: string
  badge?: { label: string; color: 'red' | 'green' | 'amber' | 'blue' }
  trend?: { value: string; up: boolean }
  accent?: AccentColor
}

const ACCENT_STYLES: Record<AccentColor, { border: string; bg: string; icon: string }> = {
  indigo: { border: '#4f46e5', bg: 'rgba(79,70,229,0.04)',  icon: 'rgba(79,70,229,0.10)' },
  green:  { border: '#16a34a', bg: 'rgba(22,163,74,0.04)',  icon: 'rgba(22,163,74,0.10)' },
  amber:  { border: '#d97706', bg: 'rgba(217,119,6,0.04)',  icon: 'rgba(217,119,6,0.10)' },
  red:    { border: '#dc2626', bg: 'rgba(220,38,38,0.04)',  icon: 'rgba(220,38,38,0.10)' },
  violet: { border: '#7c3aed', bg: 'rgba(124,58,237,0.04)', icon: 'rgba(124,58,237,0.10)' },
  blue:   { border: '#0ea5e9', bg: 'rgba(14,165,233,0.04)', icon: 'rgba(14,165,233,0.10)' },
}

const BADGE_STYLES = {
  red:   { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626' },
  green: { bg: 'rgba(22,163,74,0.08)',   color: '#16a34a' },
  amber: { bg: 'rgba(217,119,6,0.08)',   color: '#d97706' },
  blue:  { bg: 'rgba(79,70,229,0.08)',   color: '#4f46e5' },
}

function guessAccent(iconBg: string | undefined): AccentColor {
  if (!iconBg) return 'indigo'
  if (iconBg.includes('green'))  return 'green'
  if (iconBg.includes('amber'))  return 'amber'
  if (iconBg.includes('violet')) return 'violet'
  if (iconBg.includes('red'))    return 'red'
  if (iconBg.includes('sky') || iconBg.includes('cyan')) return 'blue'
  return 'indigo'
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  badge,
  trend,
  accent,
}: StatsCardProps) {
  const resolvedAccent = accent ?? guessAccent(iconBg)
  const styles = ACCENT_STYLES[resolvedAccent]

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200"
      style={{
        background: '#ffffff',
        border: '1px solid #e8e4de',
        borderLeft: `4px solid ${styles.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Subtle tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: styles.bg }}
      />

      <div className="relative">
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: styles.icon }}
          >
            {icon}
          </div>
          {badge && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={BADGE_STYLES[badge.color]}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Value */}
        <p
          className="font-mono text-2xl font-bold leading-none tracking-tight"
          style={{ color: '#100e0b', fontFamily: 'var(--font-mono, JetBrains Mono), monospace' }}
        >
          {value}
        </p>

        {/* Title */}
        <p className="text-xs font-medium mt-1.5 leading-snug" style={{ color: '#6b6560' }}>
          {title}
        </p>

        {/* Trend / subtitle */}
        {(trend || subtitle) && (
          <div className="mt-2.5 flex items-center gap-2">
            {trend && (
              <span
                className="text-[11px] font-bold flex items-center gap-0.5"
                style={{ color: trend.up ? '#16a34a' : '#dc2626' }}
              >
                {trend.up ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-[11px]" style={{ color: '#9c9690' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
