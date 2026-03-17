'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, PlusCircle, Calculator } from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log Trip', icon: PlusCircle },
  { href: '/tax', label: 'Tax Tools', icon: Calculator },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav style={{ background: '#111118', borderBottom: '1px solid #1e1e2e' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Car size={20} style={{ color: '#f59e0b' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '0.1em',
            color: '#f59e0b'
          }}>
            GIG<span style={{ color: '#e2e2f0' }}>TRACKER</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                path === href
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
