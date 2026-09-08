# YMCJB — BidSheet

Job estimate webapp supporting **Time & Equipment** and **Fixed Price (NTE)** templates (recreated from the Excel workbooks).

## Features

- Template switcher: Time & Equipment rates sheet **or** Fixed Price not-to-exceed total
- Estimate intake form (estimator, customer, scope, schedule, OT structure, profit tiers)
- Add/remove personnel lines with wage-schedule salary bands and COL adjustment
- Fixed Price: estimated weeks, estimate risk %, completion bonus / contingency %
- Add catalog or custom equipment lines with COL-adjusted hourly / daily / weekly rates
- Add unlimited additional approval items plus GSA lodging & meals per diem by project state
- Live printable estimate document + rate / price summary
- Local browser persistence, demo data, JSON export

## Web app

**Live preview (current build):** https://forum-motivation-told-poetry.trycloudflare.com

> This Cloudflare tunnel stays up while the cloud agent/session is running.

**Stable GitHub Pages URL (after enabling Pages):** https://k9rottwiler-ai.github.io/YMCJB/

A `gh-pages` branch with the production build is already published. To activate it:
1. Open https://github.com/k9rottwiler-ai/YMCJB/settings/pages
2. Set Source to **Deploy from a branch**
3. Choose branch **`gh-pages`** / root (`/`) → Save

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Calculation notes

Pricing logic mirrors the Excel workbooks:

- Wage schedule ST/OT/contingency rates from annual salary × profit tier
- COL delta = `(project COL − base COL) / 100`
- Adjusted salary = ceiling to nearest $5,000 after COL
- Equipment hourly rate adjusted by COL; daily ×8, weekly ×40
- State COL indexes from MERIC / C2ER Q2 2026 composite
- Per diem from state averages of FY27 GSA lodging / M&IE rates

### Fixed Price extras

- Personnel hours = estimated weeks × 40, then × (1 + risk%)
- Personnel NTE amount = blended bill rate × adjusted hours (prefers 5OT/10OT contingency structures; “OT billed separately” uses the 10OT blended column for the NTE, matching the Excel FP sheet)
- Equipment amount = weekly rate × qty × risk-adjusted weeks
- Lodging / meals = weekly per diem × rooms or employees × risk-adjusted weeks
- Contingency = subtotal × contingency %
- Grand total = subtotal + contingency (not-to-exceed)
