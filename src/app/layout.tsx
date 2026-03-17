import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'GigTracker — Rideshare Income & Tax Dashboard',
  description: 'Track rideshare earnings, mileage deductions, and SEP-IRA contributions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <footer className="text-center py-4 text-xs" style={{ color: '#2a2a3e', fontFamily: 'var(--font-mono)' }}>
            GIGTRACKER © {new Date().getFullYear()} — IRS MILEAGE RATE $0.70/MI
          </footer>
        </div>
      </body>
    </html>
  )
}
