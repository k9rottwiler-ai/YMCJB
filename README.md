# YMCJB — BidSheet

Job estimate webapp supporting **Time & Equipment** and **Fixed Price (NTE)** templates (recreated from the Excel workbooks).

## Features

- Template switcher: Time & Equipment rates sheet **or** Fixed Price not-to-exceed total
- Estimate intake form (estimator, customer, scope, schedule, OT structure, profit tiers)
- Add/remove personnel lines with wage-schedule salary bands and COL adjustment
- Fixed Price: estimated weeks, estimate risk %, completion bonus / contingency %
- Add catalog or custom equipment lines with COL-adjusted hourly / daily / weekly rates
- Add unlimited additional approval items plus GSA lodging & meals per diem by project state
- **Administration** page to update wage rates, equipment rates, per diem, and COL indexes
- CSV / JSON download templates + import; browser overrides with export for `reference.json`
- Live printable estimate document + rate / price summary
- Local browser persistence, demo data, JSON export

## Web app

**Stable app URL:** https://k9rottwiler-ai.github.io/YMCJB/

GitHub Pages is enabled from the `gh-pages` branch (includes Administration, T&E, and Fixed Price).

> Ephemeral Cloudflare preview tunnels expire when the agent session ends — use the Pages URL above.

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

## Administration & templates

Open **Administration** in the app header to:

| Dataset | Edit UI | Template file |
|--------|---------|----------------|
| Per diem + COL | States table | `public/templates/perdiem-col-template.csv` |
| Wage schedule rates | Filtered wage table | `public/templates/wage-rates-template.csv` |
| Equipment rates | Catalog table + hour factors | `public/templates/equipment-rates-template.csv` |
| Full bundle | Import/export JSON | `public/templates/reference-defaults.json` |

CSV columns:

- Per diem/COL: `name,abbr,lodging,meals,colIndex`
- Wages: `category,wageYr,wageHr,stPrice,otPrice,st5ot,st10ot`
- Equipment: `class,name,hourlyRate`

Saves persist in the browser (`localStorage`). Export full JSON and replace `src/data/reference.json` to ship defaults to all users.

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
