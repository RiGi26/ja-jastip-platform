'use client'

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://japanarenacorp.com'

export default function BackToCorpBanner() {
  return (
    <div className="bg-slate-900 text-white/50 text-center py-2.5 px-4 text-xs">
      Powered by{' '}
      <a
        href={LANDING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
      >
        Japan Arena Corp
      </a>
      <span className="mx-2">·</span>
      <a
        href={`${LANDING_URL}#segmen`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white/80 transition-colors"
      >
        Lihat produk lainnya →
      </a>
    </div>
  )
}
