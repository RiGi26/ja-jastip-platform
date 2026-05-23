'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  accentColor?: string
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  accentColor = '#4f46e5',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(8,12,20,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col animate-modal-in`}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.20), 0 8px 20px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Colored top accent */}
        <div className="h-0.5 w-full flex-shrink-0" style={{ background: accentColor }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #f0ede8' }}
        >
          <h2
            className="font-extrabold text-sm tracking-tight"
            style={{ color: '#100e0b' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
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
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
