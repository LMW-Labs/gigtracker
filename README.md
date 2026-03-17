# GigTracker

Rideshare income tracker with mileage deduction calculator and SEP-IRA optimizer. Built with Next.js 14, Supabase, and Tailwind CSS. Deployable to Vercel in minutes.

## Features

- **Trip Logging** — Date, platform (Lyft/Uber), miles, gross earnings, tips, hours
- **Live Mileage Preview** — Calculates IRS deduction ($0.70/mi) on every trip entry
- **Dashboard** — YTD totals, monthly earnings chart, miles trend, trip history with delete
- **Tax Tools** — Full tax breakdown: SE tax, mileage deduction, SE deduction (50%), SEP-IRA contribution slider, effective rate calculator
- **Supabase** — Persistent storage across devices

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/gigtracker
cd gigtracker
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### 3. Add Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push repo to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Tax Notes

- IRS standard mileage rate: **$0.70/mile** (2025)
- Self-employment tax: **15.3%** of net SE income
- SE tax deduction: **50%** of SE tax owed (above-the-line)
- SEP-IRA max: **25% of net SE income**, up to $69,000 (2025)
- Quarterly estimated taxes due: **April 15, June 16, September 15, January 15**

> This tool is for personal financial tracking only. Consult a CPA for tax advice.
