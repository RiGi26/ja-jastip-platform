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
        <p className="font-black text-gray-700 text-lg">Akses Terbatas</p>
        <p className="text-gray-400 text-sm mt-1">
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Pengaturan Usaha</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kustomisasi identitas dan tarif bisnismu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <RotateCcw size={14} />
            Reset Default
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors" title="Lihat tampilan yang dilihat pelangganmu">
            <ExternalLink size={14} />
            Halaman Publik
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['identity', 'rates'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'identity' ? 'Identitas Usaha' : 'Pengaturan Tarif'}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-black text-gray-900 text-base">Edit Identitas</h2>

            <div>
              <label htmlFor="businessName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Usaha</label>
              <input id="businessName" type="text" value={form.businessName} onChange={e => setField('businessName', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label htmlFor="tagline" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tagline <span className="font-normal text-gray-400">(max 80 karakter)</span></label>
              <input id="tagline" type="text" maxLength={80} value={form.tagline} onChange={e => setField('tagline', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">{form.tagline.length}/80</p>
            </div>

            <div>
              <label htmlFor="waNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nomor WhatsApp</label>
              <input id="waNumber" type="text" value={form.waNumber} onChange={e => setField('waNumber', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="628xxxxxxxxxx" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="originCountry" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Negara Asal</label>
                <select id="originCountry" value={form.originCountry} onChange={e => setField('originCountry', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="originCurrency" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mata Uang</label>
                <select id="originCurrency" value={form.originCurrency} onChange={e => setField('originCurrency', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="countryEmoji" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Emoji Bendera</label>
              <input id="countryEmoji" type="text" value={form.countryEmoji} onChange={e => setField('countryEmoji', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="🇯🇵" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="primaryColor" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Warna Primer</label>
                <div className="flex gap-2 items-center">
                  <input id="primaryColor" type="color" value={form.primaryColor} onChange={e => setField('primaryColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <span className="text-sm font-mono text-gray-600">{form.primaryColor}</span>
                </div>
              </div>
              <div>
                <label htmlFor="accentColor" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Warna Aksen</label>
                <div className="flex gap-2 items-center">
                  <input id="accentColor" type="color" value={form.accentColor} onChange={e => setField('accentColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <span className="text-sm font-mono text-gray-600">{form.accentColor}</span>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors mt-2">
              <Save size={15} />
              Simpan Pengaturan
            </button>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-gray-400" />
              <h2 className="font-black text-gray-900 text-base">Live Preview</h2>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200">
              {/* Simulated hero */}
              <div className="p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.accentColor} 100%)` }}>
                <p className="text-3xl mb-2">{form.countryEmoji}</p>
                <h3 className="font-black text-xl">{form.businessName}</h3>
                <p className="text-sm opacity-80 mt-1">{form.tagline}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full">
                  💬 WhatsApp: +{form.waNumber}
                </div>
              </div>

              {/* Simulated stats bar */}
              <div className="bg-white px-4 py-3 flex justify-around border-t border-gray-100">
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: form.primaryColor }}>99.4%</p>
                  <p className="text-xs text-gray-400">Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: form.primaryColor }}>5-9 Hr</p>
                  <p className="text-xs text-gray-400">Pengiriman</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: form.primaryColor }}>{form.originCurrency}</p>
                  <p className="text-xs text-gray-400">Mata Uang</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400 mt-3">
              Begini tampilan halaman utamamu setelah disimpan
            </p>
          </div>
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="font-black text-gray-900 text-base">Pengaturan Tarif</h2>

          {/* Base rates */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tarif Dasar</p>
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
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">{f.label}</label>
                  <input
                    type="number"
                    min={0}
                    value={rateForm[f.key]}
                    onChange={e => updateRate(f.key, Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori Barang</p>
            <div className="space-y-2">
              {rateForm.categories.map((cat, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input type="text" value={cat.label} onChange={e => updateCategory(i, 'label', e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex-shrink-0">+Rp</span>
                    <input type="number" min={0} value={cat.surcharge} onChange={e => updateCategory(i, 'surcharge', Number(e.target.value))} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Jenis Pengiriman</p>
            <div className="space-y-2">
              {rateForm.services.map((svc, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <input type="text" value={svc.label} onChange={e => updateService(i, 'label', e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex-shrink-0">×</span>
                    <input type="number" min={0.1} step={0.1} value={svc.multiplier} onChange={e => updateService(i, 'multiplier', Number(e.target.value))} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSaveRates} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
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
