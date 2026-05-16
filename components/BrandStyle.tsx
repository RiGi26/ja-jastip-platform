'use client'

import { useEffect, useState } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { BusinessSettings } from '@/lib/types'

const DEFAULT_PRIMARY = '#1D4ED8'
const DEFAULT_ACCENT = '#3B82F6'

export default function BrandStyle() {
  const [colors, setColors] = useState({ primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT })

  useEffect(() => {
    const settings = storage.get<BusinessSettings>(STORAGE_KEYS.SETTINGS)
    if (settings) {
      setColors({ primary: settings.primaryColor, accent: settings.accentColor })
    }
  }, [])

  return (
    <style>{`
      :root {
        --brand-primary: ${colors.primary};
        --brand-accent: ${colors.accent};
      }
    `}</style>
  )
}
