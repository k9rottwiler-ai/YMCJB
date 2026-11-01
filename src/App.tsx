import { useEffect, useMemo, useState } from "react";
import { EstimateDocument } from "./components/EstimateDocument";
import { EstimateForm } from "./components/EstimateForm";
import { RateSummary } from "./components/RateSummary";
import type { EstimateInput } from "./domain/entities/Estimate";
import { Formatters } from "./formatting/Formatters";
import { EstimateCalculator } from "./services/EstimateCalculator";
import { EstimateFactory } from "./services/EstimateFactory";
import { EstimateStorage } from "./services/EstimateStorage";

const factory = new EstimateFactory();
const calculator = new EstimateCalculator();
const storage = new EstimateStorage("bidsheet-te-estimate-v1", factory);

type PreviewTab = "document" | "summary";

export default function App() {
  const [estimate, setEstimate] = useState<EstimateInput>(() => storage.load());
  const [tab, setTab] = useState<PreviewTab>("document");
  const computed = useMemo(() => calculator.compute(estimate), [estimate]);

  useEffect(() => {
    storage.save(estimate);
  }, [estimate]);

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
            COL adj {Formatters.pct(computed.colDelta)}
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => setEstimate(factory.createDemo())}
          >
            Load demo
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setEstimate(factory.createEmpty())}
          >
            New estimate
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => storage.exportJson(estimate, computed)}
          >
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
