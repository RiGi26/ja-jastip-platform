'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function SlideOver({ open, onClose, title, children }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(8,12,20,0.60)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl h-full flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: '#fdfcfb',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          borderLeft: '1px solid #ece9e3',
        }}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full flex-shrink-0" style={{ background: '#4f46e5' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #ece9e3' }}
        >
          <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup panel"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#9c9690' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f0ede8'
              e.currentTarget.style.color = '#6b6560'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#9c9690'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
