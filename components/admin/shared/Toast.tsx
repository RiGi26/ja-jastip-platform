'use client'

import { useEffect, createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_CONFIG = {
  success: {
    icon:   <CheckCircle size={16} />,
    border: '#16a34a',
    iconColor: '#16a34a',
    bg:     '#f0fdf4',
  },
  error: {
    icon:   <XCircle size={16} />,
    border: '#dc2626',
    iconColor: '#dc2626',
    bg:     '#fef2f2',
  },
  info: {
    icon:   <Info size={16} />,
    border: '#4f46e5',
    iconColor: '#4f46e5',
    bg:     '#eef2ff',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <ToastNotification key={t.id} item={t} onRemove={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastNotification({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const cfg = TOAST_CONFIG[item.type]

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 animate-toast-in"
      style={{
        background: '#ffffff',
        borderLeft: `4px solid ${cfg.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e8e4de',
        borderLeftWidth: '4px',
        borderLeftColor: cfg.border,
      }}
    >
      <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }}>
        {cfg.icon}
      </span>
      <p className="flex-1 text-sm font-semibold" style={{ color: '#100e0b' }}>
        {item.message}
      </p>
      <button
        onClick={onRemove}
        aria-label="Tutup notifikasi"
        className="flex-shrink-0 transition-colors"
        style={{ color: '#9c9690' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#6b6560' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9c9690' }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus digunakan dalam ToastProvider')
  return ctx
}
