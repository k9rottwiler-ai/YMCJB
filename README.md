# YMCJB — BidSheet

Job estimate webapp supporting **Time & Equipment**, **Fixed Price (NTE)**, and **Unit Pricing** templates (recreated from the Excel workbooks).

## Features

- Template switcher: Time & Equipment rates sheet, Fixed Price not-to-exceed total, **or Unit Pricing schedule**
- Estimate intake form (estimator, customer, scope, schedule, OT structure / productivity factor, profit tiers)
- Add/remove personnel lines with wage-schedule salary bands and COL adjustment
- Fixed Price: estimated weeks, estimate risk %, completion bonus / contingency %
- Unit Pricing: unit activities (mins, resource/equipment counts), crew quantities, 40ST+5OT blend → unit rates
- Add catalog or custom equipment lines with COL-adjusted hourly / daily / weekly rates
- Add unlimited additional approval items plus GSA lodging & meals per diem by project state
- **Administration** page to update wage rates, equipment rates, per diem, and COL indexes
- CSV / JSON download templates + import; browser overrides with export for `reference.json`
- Password protection (in-app unlock + optional Railway HTTP basic auth)
- Live printable estimate document + rate / price / unit summary
- Local browser persistence, demo data, JSON export

## Web app

**Railway (production):** https://ymcjb-production.up.railway.app/

**GitHub Pages:** https://k9rottwiler-ai.github.io/YMCJB/

> Prefer Railway for the primary shareable URL. Redeploy from the latest branch if Administration is missing (older builds only have T&E + Fixed Price).

## Password protection

### In-app unlock (all hosts)

Production password is set in `.env.production` as `VITE_APP_PASSWORD` (not published here — ask an admin or check Railway variables / your secure notes).

- Change it by setting `VITE_APP_PASSWORD` in Railway **Variables** (build-time) or editing `.env.production`, then redeploy/rebuild.
- Leave `VITE_APP_PASSWORD` empty to disable the login screen.
- Session unlock lasts for the browser tab (`sessionStorage`). Use **Lock** in the header to require the password again.

### Railway HTTP basic auth (optional, stronger)

Set these Railway service variables (runtime — no rebuild required for password changes):

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_USERNAME` | `admin` | Basic-auth username |
| `APP_PASSWORD` | _(unset)_ | Basic-auth password (enables Caddy `basic_auth` when set) |

When `APP_PASSWORD` is set, the browser shows a native login prompt before the app loads. You can use this alone, or together with the in-app gate.

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

## Deploy on Railway

This is a Vite SPA. Railway needs a static server after `npm run build` — the repo includes `Caddyfile` + `nixpacks.toml` for that.

1. Push this branch to GitHub (already done if you’re on the agent branch).
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select `k9rottwiler-ai/YMCJB` and the branch you want (e.g. `cursor/admin-rates-perdiem-col-7857` or `main` after merge).
4. Leave build/start empty — Nixpacks will run `npm run build` and start Caddy from `nixpacks.toml`.
5. Open the service → **Settings** → **Networking** → **Generate Domain**.

Optional CLI:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway domain
```

Do **not** set the start command to `npm run dev` or `vite` — that runs the development server, not production.

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
