'use client'
import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'

const IRS_RATE = 0.70
const SE_TAX = 0.153
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function TaxTools() {
  const [year] = useState(new Date().getFullYear())
  const [annualGross, setAnnualGross] = useState('')
  const [annualMiles, setAnnualMiles] = useState('')
  const [sepContrib, setSepContrib] = useState('')
  const [incomeTaxRate, setIncomeTaxRate] = useState('22')
  const [ytdLoaded, setYtdLoaded] = useState(false)

  // Load real YTD data
  useEffect(() => {
    fetch(`/api/summary?year=${year}`).then(r => r.json()).then(data => {
      if (data.totalGross > 0) {
        setAnnualGross(data.totalGross.toFixed(2))
        setAnnualMiles(data.totalMiles.toFixed(1))
        setYtdLoaded(true)
      }
    })
  }, [year])

  const gross = parseFloat(annualGross) || 0
  const miles = parseFloat(annualMiles) || 0
  const sep = parseFloat(sepContrib) || 0
  const taxRate = parseFloat(incomeTaxRate) / 100 || 0.22

  const mileageDeduct = miles * IRS_RATE
  const netAfterMileage = Math.max(0, gross - mileageDeduct)
  const seTax = netAfterMileage * SE_TAX
  const seDeduct = seTax * 0.5
  const sepMax = Math.min(netAfterMileage * 0.25, 69000)
  const taxableIncome = Math.max(0, netAfterMileage - seDeduct - sep)
  const incomeTaxBill = taxableIncome * taxRate
  const totalTaxBill = seTax + incomeTaxBill

  // Without any deductions
  const taxWithoutDeductions = (gross * SE_TAX) + (gross * taxRate)
  const totalSavings = taxWithoutDeductions - totalTaxBill
  const effectiveRate = gross > 0 ? (totalTaxBill / gross) * 100 : 0

  const Tip = ({ text }: { text: string }) => (
    <span title={text} style={{ cursor: 'help', marginLeft: '0.3rem', verticalAlign: 'middle' }}>
      <Info size={12} style={{ color: '#4a4a6a', display: 'inline' }} />
    </span>
  )

  const Row = ({ label, value, color = '#e2e2f0', tip = '', badge = '' }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #1e1e2e' }}>
      <span style={{ fontSize: '0.8rem', color: '#a0a0c0', fontFamily: 'var(--font-display)' }}>
        {label}
        {tip && <Tip text={tip} />}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {badge && <span className={`badge badge-${badge === 'SAVES' ? 'teal' : badge === 'OWES' ? 'red' : 'amber'}`}>{badge}</span>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  )

  return (
    <div className="animate-fadeup" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#e2e2f0' }}>
          Tax Tools
        </h1>
        <p style={{ color: '#4a4a6a', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
          MILEAGE DEDUCTION + SEP-IRA OPTIMIZER — TAX YEAR {year}
        </p>
        {ytdLoaded && (
          <p style={{ color: '#14b8a6', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem' }}>
            ✓ LOADED REAL YTD DATA FROM YOUR TRIPS
          </p>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Inputs */}
        <div className="card space-y-4">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em' }}>
            INPUT VARIABLES
          </p>

          {[
            { label: 'ANNUAL GROSS EARNINGS ($)', val: annualGross, set: setAnnualGross, tip: 'Total rideshare earnings before any deductions' },
            { label: 'TOTAL BUSINESS MILES', val: annualMiles, set: setAnnualMiles, tip: 'All miles driven for rideshare. Track with Stride or Everlance.' },
            { label: 'SEP-IRA CONTRIBUTION ($)', val: sepContrib, set: setSepContrib, tip: `Max allowed: ${fmt(sepMax)}. This reduces your taxable income dollar-for-dollar.` },
            { label: 'INCOME TAX RATE (%)', val: incomeTaxRate, set: setIncomeTaxRate, tip: 'Your marginal federal rate. At ~$65k salary you\'re in the 22% bracket.' },
          ].map(({ label, val, set, tip }) => (
            <div key={label}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                {label} <Tip text={tip} />
              </label>
              <input
                type="number"
                step="any"
                value={val}
                onChange={e => set(e.target.value)}
                className="input-field"
              />
            </div>
          ))}

          {/* SEP-IRA slider */}
          {sepMax > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', marginBottom: '0.3rem' }}>
                <span>SEP-IRA SLIDER</span>
                <span style={{ color: '#f59e0b' }}>MAX: {fmt(sepMax)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.ceil(sepMax)}
                step={100}
                value={sep}
                onChange={e => setSepContrib(e.target.value)}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#f59e0b', textAlign: 'right' }}>
                {fmt(sep)} / {fmt(sepMax)}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="card">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4a4a6a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            TAX BREAKDOWN
          </p>

          <Row label="Gross Income" value={fmt(gross)} />
          <Row label="Mileage Deduction" value={`-${fmt(mileageDeduct)}`} color="#14b8a6" badge="SAVES" tip="$0.70 × miles driven" />
          <Row label="Net After Mileage" value={fmt(netAfterMileage)} />
          <Row label="Self-Employment Tax (15.3%)" value={fmt(seTax)} color="#ef4444" badge="OWES" />
          <Row label="SE Tax Deduction (50%)" value={`-${fmt(seDeduct)}`} color="#14b8a6" badge="SAVES" tip="IRS allows you to deduct half your SE tax" />
          <Row label="SEP-IRA Deduction" value={`-${fmt(sep)}`} color="#14b8a6" badge="SAVES" />
          <Row label="Taxable Income" value={fmt(taxableIncome)} />
          <Row label={`Income Tax (${incomeTaxRate}%)`} value={fmt(incomeTaxBill)} color="#ef4444" badge="OWES" />

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#0a0a0f', borderRadius: 8, border: '1px solid #1e1e2e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4a4a6a' }}>TOTAL TAX BILL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{fmt(totalTaxBill)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4a4a6a' }}>EFFECTIVE RATE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa' }}>{effectiveRate.toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#4a4a6a' }}>YOU SAVE VS NO DEDUCTIONS</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>{fmt(Math.max(0, totalSavings))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy cards */}
      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[
          {
            title: 'Track Every Mile',
            body: 'Use Stride (free) or Everlance to auto-track. At $0.70/mi, 1,000 miles = $700 off your taxes.',
            color: '#14b8a6',
          },
          {
            title: 'Open a SEP-IRA',
            body: `You can contribute up to ${fmt(sepMax)} this year. Fidelity has no minimums or fees. Every dollar reduces your taxable income.`,
            color: '#f59e0b',
          },
          {
            title: 'Pay Quarterly Taxes',
            body: 'SE income requires estimated quarterly payments (Apr, Jun, Sep, Jan) to avoid IRS underpayment penalties.',
            color: '#a78bfa',
          },
        ].map(({ title, body, color }) => (
          <div key={title} className="card" style={{ borderLeft: `3px solid ${color}` }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color, marginBottom: '0.5rem' }}>{title}</p>
            <p style={{ fontSize: '0.8rem', color: '#a0a0c0', lineHeight: 1.5 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
