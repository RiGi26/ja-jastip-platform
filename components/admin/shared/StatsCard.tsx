import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBg?: string
  badge?: { label: string; color: 'red' | 'green' | 'amber' | 'blue' }
  trend?: { value: string; up: boolean }
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-100',
  badge,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              badge.color === 'red'
                ? 'bg-red-100 text-red-600'
                : badge.color === 'green'
                ? 'bg-green-100 text-green-600'
                : badge.color === 'amber'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-bold ${
                trend.up ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trend.up ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
