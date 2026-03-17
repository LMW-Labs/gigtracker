'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function LogTrip() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    platform: 'lyft',
    miles: '',
    gross_earnings: '',
    tips: '',
    hours: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const mileageDeduct = form.miles ? (parseFloat(form.miles) * 0.70).toFixed(2) : '0.00'
  const totalEarned = form.gross_earnings && form.tips
    ? (parseFloat(form.gross_earnings) + parseFloat(form.tips || '0')).toFixed(2)
    : form.gross_earnings || '0.00'
  const netAfterMileage = form.gross_earnings && form.miles
    ? Math.max(0, parseFloat(form.gross_earnings) + parseFloat(form.tips || '0') - parseFloat(form.miles) * 0.70).toFixed(2)
    : '0.00'

  const handleSubmit = async () => {
    if (!form.date || !form.miles || !form.gross_earnings || !form.hours) {
      setError('Please fill in date, miles, earnings, and hours.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          platform: form.platform,
          miles: parseFloat(form.miles),
          gross_earnings: parseFloat(form.gross_earnings),
          tips: parseFloat(form.tips || '0'),
          hours: parseFloat(form.hours),
          notes: form.notes,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm(f => ({ ...f, miles: '', gross_earnings: '', tips: '', hours: '', notes: '' }))
      }, 2000)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="animate-fadeup" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#e2e2f0' }}>
          Log a Trip
        </h1>
        <p style={{ color: '#4a4a6a', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
          IRS MILEAGE RATE: $0.70/MI — TAX YEAR 2025
        </p>
      </div>

      <div className="card space-y-5">
        {/* Date + Platform */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              DATE
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              PLATFORM
            </label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)} className="input-field">
              <option value="lyft">Lyft</option>
              <option value="uber">Uber</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Miles + Hours */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              MILES DRIVEN
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={form.miles}
              onChange={e => set('miles', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              HOURS ONLINE
            </label>
            <input
              type="number"
              step="0.25"
              placeholder="0.0"
              value={form.hours}
              onChange={e => set('hours', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Earnings + Tips */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              GROSS EARNINGS ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.gross_earnings}
              onChange={e => set('gross_earnings', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              TIPS ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.tips}
              onChange={e => set('tips', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            NOTES (OPTIONAL)
          </label>
          <input
            type="text"
            placeholder="e.g. surge pricing, airport run..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Live Preview */}
        {(form.miles || form.gross_earnings) && (
          <div style={{ background: '#0a0a0f', border: '1px solid #1e1e2e', borderRadius: 8, padding: '1rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#2a2a4e', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              LIVE PREVIEW
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a' }}>TOTAL EARNED</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>${totalEarned}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a' }}>MILE DEDUCTION</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#14b8a6' }}>-${mileageDeduct}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a' }}>NET TAXABLE</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>${netAfterMileage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#ef4444', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#34d399', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <CheckCircle size={14} />
            TRIP SAVED SUCCESSFULLY
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'SAVING...' : 'SAVE TRIP'}
          </button>
          <button onClick={() => router.push('/')} className="btn-ghost">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
