'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Car, DollarSign, Clock, Route, Trash2 } from 'lucide-react'

type Summary = {
  tripCount: number
  totalMiles: number
  totalGross: number
  totalHours: number
  avgPerTrip: number
  avgPerHour: number
  mileageDeduction: number
  netIncome: number
  seTax: number
  sepMax: number
  monthly: Record<string, { gross: number; miles: number; trips: number; hours: number }>
  trips: any[]
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtShort = (n: number) => `$${Math.round(n).toLocaleString()}`

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch(`/api/summary?year=${year}`)
      if (!res.ok) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSummary(data)
    } catch (e: any) {
      setApiError(e.message || 'Failed to load data')
      setSummary(null)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [year])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trip?')) return
    setDeleting(id)
    await fetch(`/api/trips?id=${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  const monthlyData = summary?.monthly
    ? Object.entries(summary.monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
          month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
          earnings: Math.round(d.gross),
          miles: d.miles,
          trips: d.trips,
        }))
    : []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="card" style={{ padding: '0.75rem 1rem', minWidth: 120 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#f59e0b' }}>{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#e2e2f0' }}>
              {p.name}: {p.name === 'earnings' ? fmtShort(p.value) : p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fadeup">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span className="text-glow" style={{ color: '#f59e0b' }}>GIG</span>
            <span style={{ color: '#e2e2f0' }}>TRACKER</span>
          </h1>
          <p style={{ color: '#4a4a6a', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            RIDESHARE INCOME & TAX INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto' }}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#4a4a6a', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '2rem 0' }}>
          LOADING DATA...
        </div>
      ) : apiError ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderColor: '#2a1a1a' }}>
          <p style={{ color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            CONNECTION ERROR
          </p>
          <p style={{ color: '#4a4a6a', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            {apiError}
          </p>
          <button onClick={load} className="btn-primary" style={{ marginTop: '1.5rem' }}>
            RETRY
          </button>
        </div>
      ) : !summary || summary.tripCount === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Car size={32} style={{ color: '#2a2a3e', margin: '0 auto 1rem' }} />
          <p style={{ color: '#4a4a6a', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            NO TRIPS LOGGED FOR {year}
          </p>
          <a href="/log" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            LOG FIRST TRIP
          </a>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'TOTAL EARNED', value: fmt(summary.totalGross), icon: DollarSign, color: '#f59e0b', sub: `${summary.tripCount} trips` },
              { label: 'MILES DRIVEN', value: summary.totalMiles.toLocaleString(), icon: Route, color: '#14b8a6', sub: `${fmt(summary.mileageDeduction)} deduction` },
              { label: 'HOURS DRIVEN', value: summary.totalHours.toFixed(1) + 'h', icon: Clock, color: '#a78bfa', sub: `${fmt(summary.avgPerHour)}/hr avg` },
              { label: 'NET AFTER DEDUCT', value: fmt(summary.netIncome), icon: TrendingUp, color: '#34d399', sub: `SE tax: ${fmt(summary.seTax)}` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                  background: `radial-gradient(circle at top right, ${color}15, transparent)`,
                }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em' }}>{label}</p>
                    <p className="stat-value" style={{ color, marginTop: '0.25rem' }}>{value}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4a4a6a', marginTop: '0.25rem' }}>{sub}</p>
                  </div>
                  <Icon size={18} style={{ color, opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tax Summary Bar */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #16161f, #1a1a2e)', border: '1px solid #2a2a4e' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              TAX SUMMARY — {year}
            </p>
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                { label: 'Mileage Deduction', value: fmt(summary.mileageDeduction), badge: 'DEDUCTION', color: 'teal' },
                { label: 'Self-Employment Tax', value: fmt(summary.seTax), badge: 'LIABILITY', color: 'red' },
                { label: 'SE Tax Deduction (50%)', value: fmt(summary.seTax * 0.5), badge: 'DEDUCTION', color: 'teal' },
                { label: 'SEP-IRA Max Allowed', value: fmt(summary.sepMax), badge: 'OPPORTUNITY', color: 'amber' },
              ].map(({ label, value, badge, color }) => (
                <div key={label}>
                  <span className={`badge badge-${color}`}>{badge}</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#e2e2f0', marginTop: '0.4rem' }}>{value}</p>
                  <p style={{ fontSize: '0.75rem', color: '#4a4a6a', marginTop: '0.2rem' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          {monthlyData.length > 1 && (
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  MONTHLY EARNINGS
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="earnings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  MONTHLY MILES
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#4a4a6a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="miles" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Trips Table */}
          <div className="card">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              RECENT TRIPS
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                    {['DATE', 'PLATFORM', 'MILES', 'GROSS', 'TIPS', 'HOURS', 'MILEAGE DEDUCT', ''].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#2a2a4e', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.trips.slice(0, 20).map((trip: any) => (
                    <tr key={trip.id} style={{ borderBottom: '1px solid #1e1e2e' }}>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#a0a0c0' }}>{trip.date}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span className={`badge ${trip.platform === 'lyft' ? 'badge-teal' : trip.platform === 'uber' ? 'badge-amber' : 'badge-red'}`}>
                          {trip.platform?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#14b8a6' }}>{trip.miles?.toFixed(1)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#f59e0b' }}>{fmt(trip.gross_earnings)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#34d399' }}>{fmt(trip.tips)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#a0a0c0' }}>{trip.hours?.toFixed(1)}h</td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#14b8a6' }}>{fmt(trip.miles * 0.70)}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          disabled={deleting === trip.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a3e', padding: 0 }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}