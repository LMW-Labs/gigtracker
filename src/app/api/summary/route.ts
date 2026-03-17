import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcMileageDeduction, calcSETax, calcSEDeduction, calcSEPMax, IRS_MILEAGE_RATE_2025 } from '@/lib/supabase'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') || new Date().getFullYear().toString()

  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalMiles = trips.reduce((s, t) => s + (t.miles || 0), 0)
  const totalGross = trips.reduce((s, t) => s + (t.gross_earnings || 0) + (t.tips || 0), 0)
  const totalHours = trips.reduce((s, t) => s + (t.hours || 0), 0)
  const tripCount = trips.length

  const mileageDeduction = calcMileageDeduction(totalMiles, IRS_MILEAGE_RATE_2025)
  const netIncome = Math.max(0, totalGross - mileageDeduction)
  const seTax = calcSETax(netIncome)
  const seDeduction = calcSEDeduction(netIncome)
  const sepMax = calcSEPMax(netIncome)
  const taxableAfterAll = Math.max(0, netIncome - seDeduction)

  // Monthly breakdown
  const monthly: Record<string, { gross: number; miles: number; trips: number; hours: number }> = {}
  for (const trip of trips) {
    const m = trip.date?.slice(0, 7)
    if (!m) continue
    if (!monthly[m]) monthly[m] = { gross: 0, miles: 0, trips: 0, hours: 0 }
    monthly[m].gross += (trip.gross_earnings || 0) + (trip.tips || 0)
    monthly[m].miles += trip.miles || 0
    monthly[m].trips += 1
    monthly[m].hours += trip.hours || 0
  }

  return NextResponse.json({
    year,
    tripCount,
    totalMiles,
    totalGross,
    totalHours,
    avgPerTrip: tripCount > 0 ? totalGross / tripCount : 0,
    avgPerHour: totalHours > 0 ? totalGross / totalHours : 0,
    avgPerMile: totalMiles > 0 ? totalGross / totalMiles : 0,
    mileageDeduction,
    netIncome,
    seTax,
    seDeduction,
    sepMax,
    taxableAfterAll,
    monthly,
    trips,
  })
}
