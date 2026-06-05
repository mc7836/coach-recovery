import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Stroke Recovery Coach',
  description: 'AI-powered stroke recovery coaching and workout tracking',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SR</span>
            </div>
            <a href="/" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              Stroke Recovery Coach
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
