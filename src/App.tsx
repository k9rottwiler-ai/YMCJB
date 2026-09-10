import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "./components/AdminPage";
import { EstimateDocument } from "./components/EstimateDocument";
import { EstimateForm } from "./components/EstimateForm";
import { RateSummary } from "./components/RateSummary";
import {
  computeEstimate,
  createDefaultEstimate,
  money,
  normalizeEstimate,
  pct,
  switchTemplateType,
} from "./lib/calc";
import { useReference } from "./lib/reference";
import type { EstimateInput, TemplateType } from "./lib/types";

const STORAGE_KEY = "bidsheet-te-estimate-v2";

type PreviewTab = "document" | "summary";
type AppView = "estimate" | "admin";

function loadInitial(): EstimateInput {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("bidsheet-te-estimate-v1");
    if (!raw) return createDefaultEstimate();
    return normalizeEstimate(JSON.parse(raw));
  } catch {
    return createDefaultEstimate();
  }
}

function loadDemo(templateType: TemplateType = "te"): EstimateInput {
  const base = createDefaultEstimate(templateType);
  const shared = {
    ...base,
    estimatorName: "Alex Rivera",
    estimatorPhone: "(555) 201-4488",
    estimatorEmail: "alex.rivera@example.com",
    customerName: "Summit Pipeline Partners",
    projectAddress: "1840 County Rd 12, Midland, TX 79701",
    clientPhone: "(432) 555-0199",
    clientEmail: "procurement@summitpipe.example",
    projectState: "Texas",
    baseState: "Oklahoma",
    stProfit: "MED" as const,
    otProfit: "HIGH" as const,
    additionalTerms: [
      "Mobilization and demobilization included in the estimate unless otherwise agreed in writing.",
      "",
      "",
      "",
    ],
  };

  if (templateType === "fixed") {
    return {
      ...shared,
      projectScope:
        "Provide fixed-price crew and equipment support for ROW restoration and temporary access maintenance for the estimated duration, including supervision, labor, trucks, and mini-ex as scoped herein.",
      mobilizationDate: base.estimateDate,
      startDate: base.estimateDate,
      finishDate: "",
      closeOutDate: "",
      otStructure: "40ST + 10OT Labor Contingency",
      estimateRiskPct: 10,
      contingencyPct: 5,
      personnel: [
        {
          role: "Superintendent",
          name: "Jordan Lee",
          salary: 120000,
          estimatedWeeks: 4,
        },
        {
          role: "Foreman",
          name: "Casey Nguyen",
          salary: 95000,
          estimatedWeeks: 4,
        },
        {
          role: "Equipment Operator",
          name: "Riley Brooks",
          salary: 80000,
          estimatedWeeks: 3,
        },
      ],
      equipmentRows: [
        {
          name: "3/4 Ton 4wd Truck",
          count: 2,
          customHourly: "",
          estimatedWeeks: 4,
        },
        {
          name: "10K Mini Ex w/Trailer",
          count: 1,
          customHourly: "",
          estimatedWeeks: 3,
        },
        {
          name: "Skidsteer w/Trailer",
          count: 1,
          customHourly: "",
          estimatedWeeks: 3,
        },
      ],
      lodgingRooms: 2,
      lodgingWeeks: 4,
      mealsEmployees: 3,
      mealsWeeks: 4,
      extraItems: [
        {
          label: "Rental Vehicle (Client Prior Approval Required)",
          notes: "As needed for crew transport",
          amount: 1500,
        },
      ],
    };
  }

  return {
    ...shared,
    projectScope:
      "Provide time-and-equipment support for ROW restoration and temporary access maintenance, including supervision, labor, trucks, and mini-ex support as directed by the client representative.",
    mobilizationDate: base.estimateDate,
    startDate: base.estimateDate,
    finishDate: "",
    closeOutDate: "",
    otStructure: "OT Billed Separately",
    personnel: [
      {
        role: "Superintendent",
        name: "Jordan Lee",
        salary: 120000,
        estimatedWeeks: "",
      },
      {
        role: "Foreman",
        name: "Casey Nguyen",
        salary: 95000,
        estimatedWeeks: "",
      },
      {
        role: "Equipment Operator",
        name: "Riley Brooks",
        salary: 80000,
        estimatedWeeks: "",
      },
    ],
    equipmentRows: [
      { name: "3/4 Ton 4wd Truck", count: 2, customHourly: "", estimatedWeeks: "" },
      {
        name: "10K Mini Ex w/Trailer",
        count: 1,
        customHourly: "",
        estimatedWeeks: "",
      },
      {
        name: "Skidsteer w/Trailer",
        count: 1,
        customHourly: "",
        estimatedWeeks: "",
      },
    ],
    extraItems: [
      {
        label: "Rental Vehicle (Client Prior Approval Required)",
        notes: "As needed for crew transport",
        amount: "",
      },
    ],
  };
}

export default function App() {
  const [view, setView] = useState<AppView>("estimate");
  const [estimate, setEstimate] = useState<EstimateInput>(loadInitial);
  const [tab, setTab] = useState<PreviewTab>("document");
  const reference = useReference();
  const computed = useMemo(
    () => computeEstimate(estimate),
    [estimate, reference],
  );
  const isFixed = estimate.templateType === "fixed";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimate));
  }, [estimate]);

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ estimate, computed }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${estimate.estimateNumber || "bidsheet"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <header className="app-header no-print">
        <div className="brand-block">
          <div className="brand-kicker">
            {view === "admin"
              ? "Rates · Per Diem · COL"
              : isFixed
                ? "Fixed Price · Not to Exceed"
                : "Time & Equipment"}
          </div>
          <h1 className="brand-title">BidSheet</h1>
          <p className="brand-sub">
            {view === "admin"
              ? "Maintain wage schedule rates, equipment catalog rates, GSA per diem, and cost-of-living indexes. Download CSV/JSON templates or edit inline."
              : isFixed
                ? "Build a not-to-exceed job estimate from weeks, wage-schedule rates, COL, per diem, estimate risk, and contingency — then print the client sheet."
                : "Build job estimates with wage-schedule pricing, cost-of-living adjustments, equipment rates, and GSA-based per diem — then print the client-facing sheet."}
          </p>
        </div>
        <div className="header-actions">
          {view === "estimate" ? (
            <>
              <span className="meta-chip">
                COL adj {pct(computed.colDelta)}
              </span>
              {isFixed ? (
                <span className="meta-chip meta-chip-accent">
                  NTE {money(computed.fixedTotals.grandTotal)}
                </span>
              ) : null}
              <button
                type="button"
                className="btn"
                onClick={() => setView("admin")}
              >
                Administration
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEstimate(loadDemo(estimate.templateType))}
              >
                Load demo
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setEstimate(createDefaultEstimate(estimate.templateType))
                }
              >
                New estimate
              </button>
              <button type="button" className="btn" onClick={downloadJson}>
                Export JSON
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => window.print()}
              >
                Print estimate
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setView("estimate")}
            >
              Back to estimates
            </button>
          )}
        </div>
      </header>

      {view === "admin" ? (
        <section className="panel admin-panel no-print">
          <AdminPage onBack={() => setView("estimate")} />
        </section>
      ) : (
        <div className="layout">
          <section className="panel form-panel no-print">
            <div className="panel-head">
              <h2>Estimate inputs</h2>
              <div className="tabs template-tabs">
                <button
                  type="button"
                  className={`tab ${estimate.templateType === "te" ? "active" : ""}`}
                  onClick={() =>
                    setEstimate((prev) => switchTemplateType(prev, "te"))
                  }
                >
                  T&amp;E
                </button>
                <button
                  type="button"
                  className={`tab ${estimate.templateType === "fixed" ? "active" : ""}`}
                  onClick={() =>
                    setEstimate((prev) => switchTemplateType(prev, "fixed"))
                  }
                >
                  Fixed Price
                </button>
              </div>
            </div>
            <EstimateForm value={estimate} onChange={setEstimate} />
          </section>

          <section className="panel">
            <div className="panel-head no-print">
              <h2>Live output</h2>
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${tab === "document" ? "active" : ""}`}
                  onClick={() => setTab("document")}
                >
                  Estimate
                </button>
                <button
                  type="button"
                  className={`tab ${tab === "summary" ? "active" : ""}`}
                  onClick={() => setTab("summary")}
                >
                  {isFixed ? "Price summary" : "Rate summary"}
                </button>
              </div>
            </div>
            {tab === "document" ? (
              <div className="panel-body">
                <EstimateDocument input={estimate} computed={computed} />
              </div>
            ) : (
              <RateSummary input={estimate} computed={computed} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
