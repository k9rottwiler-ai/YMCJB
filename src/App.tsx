import { useEffect, useMemo, useState } from "react";
import { EstimateDocument } from "./components/EstimateDocument";
import { EstimateForm } from "./components/EstimateForm";
import { RateSummary } from "./components/RateSummary";
import {
  computeEstimate,
  createDefaultEstimate,
  pct,
} from "./lib/calc";
import type { EstimateInput } from "./lib/types";

const STORAGE_KEY = "bidsheet-te-estimate-v1";

type PreviewTab = "document" | "summary";

function loadInitial(): EstimateInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultEstimate();
    return { ...createDefaultEstimate(), ...JSON.parse(raw) };
  } catch {
    return createDefaultEstimate();
  }
}

function loadDemo(): EstimateInput {
  const base = createDefaultEstimate();
  return {
    ...base,
    estimatorName: "Alex Rivera",
    estimatorPhone: "(555) 201-4488",
    estimatorEmail: "alex.rivera@example.com",
    customerName: "Summit Pipeline Partners",
    projectAddress: "1840 County Rd 12, Midland, TX 79701",
    clientPhone: "(432) 555-0199",
    clientEmail: "procurement@summitpipe.example",
    projectScope:
      "Provide time-and-equipment support for ROW restoration and temporary access maintenance, including supervision, labor, trucks, and mini-ex support as directed by the client representative.",
    mobilizationDate: base.estimateDate,
    startDate: base.estimateDate,
    finishDate: "",
    closeOutDate: "",
    projectState: "Texas",
    baseState: "Oklahoma",
    otStructure: "OT Billed Separately",
    stProfit: "MED",
    otProfit: "HIGH",
    personnel: [
      { role: "Superintendent", name: "Jordan Lee", salary: 120000 },
      { role: "Foreman", name: "Casey Nguyen", salary: 95000 },
      { role: "Equipment Operator", name: "Riley Brooks", salary: 80000 },
      { role: "", name: "", salary: "" },
      { role: "", name: "", salary: "" },
      { role: "", name: "", salary: "" },
      { role: "", name: "", salary: "" },
    ],
    equipmentCounts: {
      ...base.equipmentCounts,
      "3/4 Ton 4wd Truck": 2,
      "10K Mini Ex w/Trailer": 1,
      "Skidsteer w/Trailer": 1,
    },
    rentalVehicle: "As needed for crew transport",
    additionalTerms: [
      "Mobilization and demobilization billed at straight-time rates unless otherwise agreed in writing.",
      "",
      "",
      "",
    ],
  };
}

export default function App() {
  const [estimate, setEstimate] = useState<EstimateInput>(loadInitial);
  const [tab, setTab] = useState<PreviewTab>("document");
  const computed = useMemo(() => computeEstimate(estimate), [estimate]);

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
          <div className="brand-kicker">Time &amp; Equipment</div>
          <h1 className="brand-title">BidSheet T&amp;E</h1>
          <p className="brand-sub">
            Build job estimates with wage-schedule pricing, cost-of-living
            adjustments, equipment rates, and GSA-based per diem — then print
            the client-facing sheet.
          </p>
        </div>
        <div className="header-actions">
          <span className="meta-chip">
            COL adj {pct(computed.colDelta)}
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => setEstimate(loadDemo())}
          >
            Load demo
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setEstimate(createDefaultEstimate())}
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
        </div>
      </header>

      <div className="layout">
        <section className="panel form-panel no-print">
          <div className="panel-head">
            <h2>Estimate inputs</h2>
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
                Rate summary
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
    </div>
  );
}
