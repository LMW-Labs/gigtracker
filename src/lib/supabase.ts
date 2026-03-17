import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Trip = {
  id?: string
  date: string
  platform: 'lyft' | 'uber' | 'both'
  miles: number
  gross_earnings: number
  tips: number
  hours: number
  notes?: string
  created_at?: string
}

export type TaxSettings = {
  id?: string
  tax_year: number
  mileage_rate: number
  sep_ira_contribution: number
  estimated_tax_rate: number
}

export const IRS_MILEAGE_RATE_2025 = 0.70
export const SE_TAX_RATE = 0.153
export const SE_DEDUCTIBLE_RATE = 0.5

export function calcMileageDeduction(miles: number, rate = IRS_MILEAGE_RATE_2025) {
  return miles * rate
}

export function calcSETax(netIncome: number) {
  return netIncome * SE_TAX_RATE
}

export function calcSEDeduction(netIncome: number) {
  return netIncome * SE_TAX_RATE * SE_DEDUCTIBLE_RATE
}

export function calcSEPMax(netSelfEmploymentIncome: number) {
  return Math.min(netSelfEmploymentIncome * 0.25, 69000)
}

export function calcTaxSavings(
  grossIncome: number,
  miles: number,
  sepContribution: number,
  incomeTaxRate = 0.22
) {
  const mileageDeduction = calcMileageDeduction(miles)
  const netAfterMileage = grossIncome - mileageDeduction
  const seTax = calcSETax(netAfterMileage)
  const seDeduction = calcSEDeduction(netAfterMileage)
  const taxableIncome = netAfterMileage - seDeduction - sepContribution
  const incomeTaxSavings = (grossIncome - taxableIncome) * incomeTaxRate
  const totalTaxBill = seTax + (taxableIncome * incomeTaxRate)
  const totalSavings = incomeTaxSavings
  return {
    mileageDeduction,
    netAfterMileage,
    seTax,
    seDeduction,
    sepDeduction: sepContribution,
    taxableIncome,
    totalTaxBill,
    totalSavings,
    effectiveRate: totalTaxBill / grossIncome,
  }
}
