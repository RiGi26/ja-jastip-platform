'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { BusinessSettings } from '@/lib/types'

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Webzoka Jastip',
  tagline: 'Jastip Profesional dari Jepang ke Indonesia',
  waNumber: '6281296917963',
  originCountry: 'Jepang',
  originCurrency: 'JPY',
  countryEmoji: '🇯🇵',
  primaryColor: '#1D4ED8',
  accentColor: '#3B82F6',
}

interface SettingsContextValue {
  settings: BusinessSettings
  saveSettings: (s: BusinessSettings) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const saved = storage.get<BusinessSettings>(STORAGE_KEYS.SETTINGS)
    if (saved) setSettings(saved)
  }, [])

  const saveSettings = useCallback((s: BusinessSettings) => {
    storage.set(STORAGE_KEYS.SETTINGS, s)
    setSettings(s)
  }, [])

  const resetSettings = useCallback(() => {
    storage.remove(STORAGE_KEYS.SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings harus digunakan dalam SettingsProvider')
  return ctx
}

export { DEFAULT_SETTINGS }
