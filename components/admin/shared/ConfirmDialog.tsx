'use client'

import { AlertTriangle, HelpCircle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const accentColor = danger ? '#dc2626' : '#d97706'
  const accentBg    = danger ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)'
  const Icon        = danger ? AlertTriangle : HelpCircle

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(8,12,20,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-sm animate-modal-in overflow-hidden"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: accentColor }} />

        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: accentBg }}
            >
              <Icon size={18} style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm" style={{ color: '#100e0b' }}>{title}</h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#6b6560' }}>{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'transparent',
                border: '1px solid #e8e4de',
                color: '#6b6560',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: danger ? '#dc2626' : '#d97706' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = danger ? '#b91c1c' : '#b45309'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = danger ? '#dc2626' : '#d97706'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
