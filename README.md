# YMCJB — BidSheet T&E

Time & Equipment job estimate webapp (recreated from `BidSheet_TE_Template.xlsx`).

## Features

- Estimate intake form (estimator, customer, scope, schedule, OT structure, profit tiers)
- Add/remove personnel lines with wage-schedule salary bands and COL adjustment
- Add catalog or custom equipment lines with COL-adjusted hourly / daily / weekly rates
- Add unlimited additional approval items plus GSA lodging & meals per diem by project state
- Live printable estimate document + rate summary
- Local browser persistence, demo data, JSON export

## Web app

**Live preview (current build):** https://quality-hart-structural-allowed.trycloudflare.com

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

Pricing logic mirrors the Excel workbook:

- Wage schedule ST/OT/contingency rates from annual salary × profit tier
- COL delta = `(project COL − base COL) / 100`
- Adjusted salary = ceiling to nearest $5,000 after COL
- Equipment hourly rate adjusted by COL; daily ×8, weekly ×40
- State COL indexes from MERIC / C2ER Q2 2026 composite
- Per diem from state averages of FY27 GSA lodging / M&IE rates
