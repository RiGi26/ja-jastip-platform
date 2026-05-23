'use client'

import { useState } from 'react'
import { Save, RotateCcw, ExternalLink, Eye } from 'lucide-react'
import { useSettings, DEFAULT_SETTINGS } from '@/contexts/SettingsContext'
import type { BusinessSettings } from '@/lib/types'
import { RATES } from '@/constants/rates'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { RateSettings } from '@/lib/types'
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import { useAuth } from '@/contexts/AuthContext'

const COUNTRIES = ['Jepang', 'Korea', 'Amerika Serikat', 'Eropa', 'China', 'Australia']
const CURRENCIES = ['JPY', 'KRW', 'USD', 'EUR', 'CNY', 'AUD']

function getDefaultRates(): RateSettings {
  return {
    basePerKg: RATES.BASE_PER_KG,
    volumeDivisor: RATES.VOLUME_DIVISOR,
    volumePerKg: RATES.VOLUME_PER_KG,
    insuranceHandling: RATES.INSURANCE_HANDLING,
    brandedFee: RATES.BRANDED_FEE,
    fragileFee: RATES.FRAGILE_FEE,
    categories: RATES.CATEGORIES.map(c => ({ ...c })),
    services: RATES.SERVICES.map(s => ({ ...s })),
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #ddd9d3',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#100e0b',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#4f46e5'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#ddd9d3'
    e.target.style.boxShadow = 'none'
  },
}

function SettingsContent() {
  const { settings, saveSettings, resetSettings } = useSettings()
  const { toast } = useToast()
  const { isOwner } = useAuth()

  const [form, setForm] = useState<BusinessSettings>({ ...settings })
  const [rateForm, setRateForm] = useState<RateSettings>(
    storage.get<RateSettings>(STORAGE_KEYS.RATE_SETTINGS) ?? getDefaultRates(),
  )
  const [confirmReset, setConfirmReset] = useState(false)
  const [activeTab, setActiveTab] = useState<'identity' | 'rates'>('identity')

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="font-extrabold text-lg" style={{ color: '#100e0b' }}>Akses Terbatas</p>
        <p className="text-sm mt-1" style={{ color: '#9c9690' }}>
          Halaman ini hanya bisa diakses oleh pemilik usaha.
        </p>
      </div>
    )
  }

  function setField<K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    saveSettings(form)
    toast('Pengaturan usaha berhasil disimpan')
  }

  function handleSaveRates() {
    storage.set(STORAGE_KEYS.RATE_SETTINGS, rateForm)
    toast('Pengaturan tarif berhasil disimpan')
  }

  function handleReset() {
    resetSettings()
    setForm({ ...DEFAULT_SETTINGS })
    setConfirmReset(false)
    toast('Pengaturan direset ke default', 'info')
  }

  function updateRate<K extends keyof Omit<RateSettings, 'categories' | 'services'>>(key: K, value: number) {
    setRateForm(prev => ({ ...prev, [key]: value }))
  }

  function updateCategory(i: number, field: 'label' | 'surcharge', value: string | number) {
    setRateForm(prev => {
      const cats = [...prev.categories]
      cats[i] = { ...cats[i], [field]: value }
      return { ...prev, categories: cats }
    })
  }

  function updateService(i: number, field: 'label' | 'multiplier', value: string | number) {
    setRateForm(prev => {
      const svcs = [...prev.services]
      svcs[i] = { ...svcs[i], [field]: value }
      return { ...prev, services: svcs }
    })
  }

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9c9690' }}>
      {children}
    </p>
  )

  const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
      style={{ color: '#9c9690' }}
    >
      {children}
    </label>
  )

  return (
    <div className="space-y-5 font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
            Pengaturan Usaha
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
            Kustomisasi identitas dan tarif bisnismu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#ffffff', border: '1px solid #e8e4de', color: '#6b6560' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff' }}
          >
            <RotateCcw size={13} />
            Reset Default
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#ffffff', border: '1px solid #e8e4de', color: '#6b6560' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f6f3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
          >
            <ExternalLink size={13} />
            Halaman Publik
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: '#f0ede8' }}
      >
        {(['identity', 'rates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={activeTab === tab
              ? { background: '#ffffff', color: '#100e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { background: 'transparent', color: '#6b6560' }
            }
          >
            {tab === 'identity' ? 'Identitas Usaha' : 'Pengaturan Tarif'}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
              Edit Identitas
            </h2>

            {[
              { id: 'businessName', label: 'Nama Usaha', value: form.businessName, key: 'businessName' as const, type: 'text' },
              { id: 'waNumber', label: 'Nomor WhatsApp', value: form.waNumber, key: 'waNumber' as const, type: 'text', placeholder: '628xxxxxxxxxx' },
              { id: 'countryEmoji', label: 'Emoji Bendera', value: form.countryEmoji, key: 'countryEmoji' as const, type: 'text', placeholder: '🇯🇵' },
            ].map(f => (
              <div key={f.id}>
                <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
                <input
                  id={f.id}
                  type={f.type}
                  value={f.value}
                  onChange={e => setField(f.key, e.target.value)}
                  placeholder={(f as { placeholder?: string }).placeholder}
                  style={inputStyle}
                  {...focusHandlers}
                />
              </div>
            ))}

            <div>
              <FieldLabel htmlFor="tagline">
                Tagline <span style={{ fontWeight: 400, color: '#9c9690', textTransform: 'none', letterSpacing: 0 }}>(max 80 karakter)</span>
              </FieldLabel>
              <input
                id="tagline"
                type="text"
                maxLength={80}
                value={form.tagline}
                onChange={e => setField('tagline', e.target.value)}
                style={inputStyle}
                {...focusHandlers}
              />
              <p className="text-xs mt-1" style={{ color: '#9c9690' }}>{form.tagline.length}/80</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="originCountry">Negara Asal</FieldLabel>
                <select
                  id="originCountry"
                  value={form.originCountry}
                  onChange={e => setField('originCountry', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                  {...focusHandlers}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="originCurrency">Mata Uang</FieldLabel>
                <select
                  id="originCurrency"
                  value={form.originCurrency}
                  onChange={e => setField('originCurrency', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none' }}
                  {...focusHandlers}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'primaryColor', label: 'Warna Primer', key: 'primaryColor' as const },
                { id: 'accentColor', label: 'Warna Aksen', key: 'accentColor' as const },
              ].map(f => (
                <div key={f.id}>
                  <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
                  <div className="flex gap-2 items-center">
                    <input
                      id={f.id}
                      type="color"
                      value={form[f.key]}
                      onChange={e => setField(f.key, e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                      style={{ border: '1px solid #ddd9d3', padding: '2px' }}
                    />
                    <span className="font-mono text-sm" style={{ color: '#6b6560' }}>{form[f.key]}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all mt-2"
              style={{ background: '#4f46e5' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4338ca'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Save size={15} />
              Simpan Pengaturan
            </button>
          </div>

          {/* Live Preview */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye size={14} style={{ color: '#9c9690' }} />
              <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
                Live Preview
              </h2>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8e4de' }}>
              <div
                className="p-6 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.accentColor} 100%)` }}
              >
                <p className="text-3xl mb-2">{form.countryEmoji}</p>
                <h3 className="font-extrabold text-xl">{form.businessName}</h3>
                <p className="text-sm opacity-80 mt-1">{form.tagline}</p>
                <div
                  className="mt-4 inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-full"
                  style={{ background: '#16a34a' }}
                >
                  💬 WhatsApp: +{form.waNumber}
                </div>
              </div>

              <div className="bg-white px-4 py-3 flex justify-around" style={{ borderTop: '1px solid #f0ede8' }}>
                {[
                  { value: '99.4%', label: 'Success Rate' },
                  { value: '5-9 Hr', label: 'Pengiriman' },
                  { value: form.originCurrency, label: 'Mata Uang' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="font-mono font-extrabold text-lg" style={{ color: form.primaryColor }}>
                      {stat.value}
                    </p>
                    <p className="text-xs" style={{ color: '#9c9690' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center mt-3" style={{ color: '#9c9690' }}>
              Begini tampilan halaman utamamu setelah disimpan
            </p>
          </div>
        </div>
      )}

      {activeTab === 'rates' && (
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <h2 className="font-extrabold text-sm tracking-tight" style={{ color: '#100e0b' }}>
            Pengaturan Tarif
          </h2>

          {/* Base rates */}
          <div>
            <SectionLabel>Tarif Dasar</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { key: 'basePerKg', label: 'Base per kg (Rp)' },
                { key: 'volumePerKg', label: 'Volume per kg (Rp)' },
                { key: 'insuranceHandling', label: 'Insurance & Handling (Rp)' },
                { key: 'brandedFee', label: 'Biaya Branded (Rp)' },
                { key: 'fragileFee', label: 'Biaya Fragile (Rp)' },
                { key: 'volumeDivisor', label: 'Volume Divisor' },
              ] as const).map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b6560' }}>{f.label}</label>
                  <input
                    type="number"
                    min={0}
                    value={rateForm[f.key]}
                    onChange={e => updateRate(f.key, Number(e.target.value))}
                    style={inputStyle}
                    {...focusHandlers}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <SectionLabel>Kategori Barang</SectionLabel>
            <div className="space-y-2">
              {rateForm.categories.map((cat, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cat.label}
                    onChange={e => updateCategory(i, 'label', e.target.value)}
                    style={inputStyle}
                    {...focusHandlers}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs flex-shrink-0" style={{ color: '#9c9690' }}>+Rp</span>
                    <input
                      type="number"
                      min={0}
                      value={cat.surcharge}
                      onChange={e => updateCategory(i, 'surcharge', Number(e.target.value))}
                      style={{ ...inputStyle, flex: 1 }}
                      {...focusHandlers}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <SectionLabel>Jenis Pengiriman</SectionLabel>
            <div className="space-y-2">
              {rateForm.services.map((svc, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={svc.label}
                    onChange={e => updateService(i, 'label', e.target.value)}
                    style={inputStyle}
                    {...focusHandlers}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs flex-shrink-0" style={{ color: '#9c9690' }}>×</span>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={svc.multiplier}
                      onChange={e => updateService(i, 'multiplier', Number(e.target.value))}
                      style={{ ...inputStyle, flex: 1 }}
                      {...focusHandlers}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveRates}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all"
            style={{ background: '#4f46e5' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#4338ca'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#4f46e5'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Save size={15} />
            Simpan Tarif
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset ke Default"
        message="Semua pengaturan identitas usaha akan dikembalikan ke nilai awal. Lanjutkan?"
        confirmLabel="Ya, Reset"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  )
}
