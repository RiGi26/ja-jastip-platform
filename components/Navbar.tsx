'use client'

import { useState, useEffect } from 'react'
import { Menu, X, LayoutGrid } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home',             href: '#'           },
  { label: 'Smart Calculator', href: '#calculator' },
  { label: 'Kategori Barang',  href: '#kategori'   },
  { label: 'Cara Order',       href: '#cara-order' },
]

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '6281296917963'
const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo JapanArena Jastip, saya ingin tanya soal jastip dari Jepang 🇯🇵')}`

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const isDark = !scrolled && !open

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <a href="#" className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          JapanArena <span className="text-red-500">Jastip</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                isDark ? 'text-white/75 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a 
            href="https://ja-landingpage-platform.vercel.app"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all group ${
              isDark 
                ? 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white' 
                : 'bg-gray-50 text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm border border-black/[0.03]'
            }`}
          >
            <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform duration-500" />
            Portal Utama
          </a>
          <a
            href="/admin"
            className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
              isDark
                ? 'border-white/20 text-white/60 hover:text-white hover:border-white/40'
                : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            Admin
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-black text-white transition-all hover:scale-[1.02] shadow-sm"
          >
            💬 Tanya via WA
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`md:hidden p-2 rounded-xl transition-colors ${
            isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-4 py-3 rounded-xl bg-green-600 text-white text-sm font-black mt-2"
          >
            💬 Tanya via WA
          </a>
          <a
            href="/admin"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors mt-1"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </header>
  )
}
