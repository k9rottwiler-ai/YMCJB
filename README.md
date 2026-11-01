# YMCJB — BidSheet T&E

Time & Equipment job estimate webapp (recreated from `BidSheet_TE_Template.xlsx`).

## Features

- Estimate intake form (estimator, customer, scope, schedule, OT structure, profit tiers)
- Up to 7 personnel with wage-schedule salary bands and COL adjustment
- Equipment quantities with COL-adjusted hourly / daily / weekly rates
- GSA-based lodging & meals per diem by project state
- Live printable estimate document + rate summary
- Local browser persistence, demo data, JSON export

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

## OOP layout

Pricing logic is organized around classic OOP concepts:

| Concept | Where |
|--------|--------|
| **Encapsulation** | `domain/entities`, `domain/valueObjects`, `catalogs/ReferenceCatalog`, `services/EstimateDraft` |
| **Inheritance** | `domain/lineItems` — `LineItem` → `PersonnelLine` / `EquipmentLine` |
| **Polymorphism** | `domain/strategies` — OT billing strategies |
| **Abstraction** | `LineItem`, `OtBillingStrategy`, `services/*` (factory, calculator, storage, draft) |

React components stay presentational and import from `domain/`, `services/`, `catalogs/`, and `formatting/`. `lib/calc.ts` and `lib/types.ts` remain thin compatibility façades.

```bash
npm test
```

## Calculation notes

Pricing logic mirrors the Excel workbook:

- Wage schedule ST/OT/contingency rates from annual salary × profit tier
- COL delta = `(project COL − base COL) / 100`
- Adjusted salary = ceiling to nearest $5,000 after COL
- Equipment hourly rate adjusted by COL; daily ×8, weekly ×40
- Per diem from state averages of FY25 GSA lodging / M&IE rates
