import { useEffect, useMemo, useRef, useState } from "react";
import {
  downloadTextFile,
  emptyEquipmentTemplateCsv,
  emptyStateTemplateCsv,
  emptyWageTemplateCsv,
  equipmentToCsv,
  getDefaultReference,
  hasReferenceOverrides,
  normalizeReference,
  parseEquipmentCsv,
  parseStatesCsv,
  parseWagesCsv,
  resetReferenceToDefaults,
  setReference,
  statesToCsv,
  useReference,
  wagesToCsv,
  type EquipmentRow,
  type ReferenceData,
  type StateRow,
  type WageRow,
} from "../lib/reference";

type AdminTab = "wages" | "equipment" | "states" | "templates";

type Props = {
  onBack: () => void;
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsText(file);
  });
}

export function AdminPage({ onBack }: Props) {
  const reference = useReference();
  const [tab, setTab] = useState<AdminTab>("states");
  const [draft, setDraft] = useState<ReferenceData>(() =>
    structuredClone(reference),
  );
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [wageFilter, setWageFilter] = useState("MED");
  const [wageSearch, setWageSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importKind, setImportKind] = useState<
    "wages" | "states" | "equipment" | "json"
  >("states");
  const [baseline, setBaseline] = useState(() => JSON.stringify(reference));

  useEffect(() => {
    const serialized = JSON.stringify(reference);
    setDraft(structuredClone(reference));
    setBaseline(serialized);
  }, [reference]);

  const dirty = JSON.stringify(draft) !== baseline;

  const filteredWages = useMemo(() => {
    return draft.wages
      .filter((row) => (wageFilter === "ALL" ? true : row.category === wageFilter))
      .filter((row) =>
        wageSearch.trim()
          ? String(row.wageYr).includes(wageSearch.trim())
          : true,
      )
      .sort((a, b) => b.wageYr - a.wageYr || a.category.localeCompare(b.category));
  }, [draft.wages, wageFilter, wageSearch]);

  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    return draft.states
      .filter((row) =>
        q
          ? row.name.toLowerCase().includes(q) ||
            row.abbr.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [draft.states, stateSearch]);

  function flash(ok: string) {
    setMessage(ok);
    setError("");
  }

  function flashError(msg: string) {
    setError(msg);
    setMessage("");
  }

  function saveDraft() {
    try {
      setReference(draft, true);
      flash(
        `Saved ${draft.wages.length} wage rows, ${draft.states.length} states, ${draft.equipment.length} equipment items to this browser.`,
      );
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  function discardDraft() {
    setDraft(structuredClone(reference));
    setBaseline(JSON.stringify(reference));
    flash("Discarded unsaved edits.");
  }

  function resetDefaults() {
    if (
      !window.confirm(
        "Reset rates, per diem, and COL to the bundled defaults? Browser overrides will be removed.",
      )
    ) {
      return;
    }
    resetReferenceToDefaults();
    setDraft(getDefaultReference());
    flash("Restored bundled reference defaults.");
  }

  function updateWage(indexInDraft: number, patch: Partial<WageRow>) {
    setDraft((prev) => {
      const wages = prev.wages.map((row, i) =>
        i === indexInDraft ? { ...row, ...patch } : row,
      );
      return { ...prev, wages };
    });
  }

  function updateState(indexInDraft: number, patch: Partial<StateRow>) {
    setDraft((prev) => {
      const states = prev.states.map((row, i) =>
        i === indexInDraft ? { ...row, ...patch } : row,
      );
      return { ...prev, states };
    });
  }

  function updateEquipment(index: number, patch: Partial<EquipmentRow>) {
    setDraft((prev) => {
      const equipment = prev.equipment.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      );
      return { ...prev, equipment };
    });
  }

  function addEquipmentRow() {
    setDraft((prev) => ({
      ...prev,
      equipment: [
        ...prev.equipment,
        { class: "Custom", name: "New equipment", hourlyRate: 25 },
      ],
    }));
  }

  function removeEquipmentRow(index: number) {
    setDraft((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  }

  async function onImportFile(file: File) {
    try {
      const text = await readFileAsText(file);
      if (importKind === "json") {
        const data = normalizeReference(JSON.parse(text));
        setDraft(data);
        flash(
          `Loaded JSON draft (${data.wages.length} wages, ${data.states.length} states, ${data.equipment.length} equipment). Click Save to apply.`,
        );
        return;
      }

      if (importKind === "wages") {
        const { rows, errors } = parseWagesCsv(text);
        if (!rows.length) {
          flashError(errors.join(" ") || "No wage rows imported.");
          return;
        }
        setDraft((prev) => ({ ...prev, wages: rows }));
        flash(
          `Imported ${rows.length} wage rows${errors.length ? ` (${errors.length} warnings)` : ""}. Click Save to apply.`,
        );
        return;
      }

      if (importKind === "states") {
        const { rows, errors } = parseStatesCsv(text);
        if (!rows.length) {
          flashError(errors.join(" ") || "No state rows imported.");
          return;
        }
        setDraft((prev) => ({ ...prev, states: rows }));
        flash(
          `Imported ${rows.length} state / per diem / COL rows${errors.length ? ` (${errors.length} warnings)` : ""}. Click Save to apply.`,
        );
        return;
      }

      const { rows, errors } = parseEquipmentCsv(text);
      if (!rows.length) {
        flashError(errors.join(" ") || "No equipment rows imported.");
        return;
      }
      setDraft((prev) => ({ ...prev, equipment: rows }));
      flash(
        `Imported ${rows.length} equipment rows${errors.length ? ` (${errors.length} warnings)` : ""}. Click Save to apply.`,
      );
    } catch (err) {
      flashError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <div className="admin-page">
      <div className="panel-head admin-head">
        <div>
          <h2>Administration</h2>
          <p className="hint" style={{ margin: "0.25rem 0 0" }}>
            Update wage rates, equipment rates, GSA per diem, and cost-of-living
            indexes. Changes save in this browser and apply immediately to
            estimates. Export JSON to commit into{" "}
            <code>src/data/reference.json</code>.
          </p>
        </div>
        <div className="header-actions">
          {hasReferenceOverrides() ? (
            <span className="meta-chip">Browser overrides active</span>
          ) : (
            <span className="meta-chip">Using bundled defaults</span>
          )}
          {dirty ? <span className="meta-chip meta-chip-accent">Unsaved</span> : null}
          <button type="button" className="btn" onClick={onBack}>
            Back to estimates
          </button>
        </div>
      </div>

      <div className="panel-body">
        {(message || error) && (
          <div className={`admin-banner ${error ? "error" : "ok"}`}>
            {error || message}
          </div>
        )}

        <div className="admin-toolbar">
          <div className="tabs">
            {(
              [
                ["states", "Per diem & COL"],
                ["wages", "Wage rates"],
                ["equipment", "Equipment rates"],
                ["templates", "Templates & import"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`tab ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="section-actions">
            <button type="button" className="btn btn-small" onClick={discardDraft} disabled={!dirty}>
              Discard
            </button>
            <button type="button" className="btn btn-small" onClick={resetDefaults}>
              Reset defaults
            </button>
            <button
              type="button"
              className="btn btn-small btn-accent"
              onClick={saveDraft}
              disabled={!dirty}
            >
              Save changes
            </button>
          </div>
        </div>

        {tab === "states" ? (
          <section className="section">
            <div className="section-head">
              <div>
                <h3>State per diem &amp; cost of living</h3>
                <p className="hint">
                  Lodging / meals are daily GSA-based averages. COL index drives
                  wage and equipment adjustments.
                </p>
              </div>
              <div className="field" style={{ minWidth: "12rem" }}>
                <label htmlFor="stateSearch">Filter</label>
                <input
                  id="stateSearch"
                  value={stateSearch}
                  placeholder="State or abbr"
                  onChange={(e) => setStateSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Abbr</th>
                    <th>Lodging $/day</th>
                    <th>Meals $/day</th>
                    <th>COL index</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStates.map((row) => {
                    const index = draft.states.findIndex(
                      (s) => s.abbr === row.abbr && s.name === row.name,
                    );
                    return (
                      <tr key={`${row.abbr}-${row.name}`}>
                        <td>
                          <input
                            value={row.name}
                            onChange={(e) =>
                              updateState(index, { name: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={row.abbr}
                            maxLength={2}
                            onChange={(e) =>
                              updateState(index, {
                                abbr: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={row.lodging}
                            onChange={(e) =>
                              updateState(index, {
                                lodging: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={row.meals}
                            onChange={(e) =>
                              updateState(index, {
                                meals: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={row.colIndex}
                            onChange={(e) =>
                              updateState(index, {
                                colIndex: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === "wages" ? (
          <section className="section">
            <div className="section-head">
              <div>
                <h3>Wage schedule bill rates</h3>
                <p className="hint">
                  Lookup key is profit tier (category) + annual salary band.
                  ST / OT / 5OT / 10OT are hourly bill rates.
                </p>
              </div>
              <div className="grid grid-2" style={{ minWidth: "18rem" }}>
                <div className="field">
                  <label htmlFor="wageFilter">Profit tier</label>
                  <select
                    id="wageFilter"
                    value={wageFilter}
                    onChange={(e) => setWageFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    {draft.profitTiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="wageSearch">Salary contains</label>
                  <input
                    id="wageSearch"
                    value={wageSearch}
                    placeholder="e.g. 120000"
                    onChange={(e) => setWageSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Salary / yr</th>
                    <th>Wage / hr</th>
                    <th>ST</th>
                    <th>OT</th>
                    <th>40ST+5OT</th>
                    <th>40ST+10OT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWages.map((row) => {
                    const index = draft.wages.findIndex(
                      (w) =>
                        w.category === row.category && w.wageYr === row.wageYr,
                    );
                    return (
                      <tr key={`${row.category}-${row.wageYr}`}>
                        <td>{row.category}</td>
                        <td>{row.wageYr.toLocaleString()}</td>
                        <td>
                          <input
                            type="number"
                            step={0.0001}
                            value={row.wageHr}
                            onChange={(e) =>
                              updateWage(index, {
                                wageHr: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.stPrice}
                            onChange={(e) =>
                              updateWage(index, {
                                stPrice: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.otPrice}
                            onChange={(e) =>
                              updateWage(index, {
                                otPrice: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.st5ot}
                            onChange={(e) =>
                              updateWage(index, {
                                st5ot: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.st10ot}
                            onChange={(e) =>
                              updateWage(index, {
                                st10ot: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint">
              Showing {filteredWages.length} of {draft.wages.length} wage rows.
            </p>
          </section>
        ) : null}

        {tab === "equipment" ? (
          <section className="section">
            <div className="section-head">
              <div>
                <h3>Equipment catalog rates</h3>
                <p className="hint">
                  Hourly base rates before COL. Daily ×{" "}
                  {draft.equipmentFactors.dailyHours}, weekly ×{" "}
                  {draft.equipmentFactors.weeklyHours}, monthly ×{" "}
                  {draft.equipmentFactors.monthlyHours}.
                </p>
              </div>
              <button type="button" className="btn btn-small" onClick={addEquipmentRow}>
                Add equipment
              </button>
            </div>
            <div className="grid grid-3" style={{ marginBottom: "0.85rem" }}>
              <div className="field">
                <label htmlFor="dailyHours">Daily hours factor</label>
                <input
                  id="dailyHours"
                  type="number"
                  min={1}
                  value={draft.equipmentFactors.dailyHours}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      equipmentFactors: {
                        ...prev.equipmentFactors,
                        dailyHours: Math.max(1, Number(e.target.value) || 1),
                      },
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="weeklyHours">Weekly hours factor</label>
                <input
                  id="weeklyHours"
                  type="number"
                  min={1}
                  value={draft.equipmentFactors.weeklyHours}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      equipmentFactors: {
                        ...prev.equipmentFactors,
                        weeklyHours: Math.max(1, Number(e.target.value) || 1),
                      },
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="monthlyHours">Monthly hours factor</label>
                <input
                  id="monthlyHours"
                  type="number"
                  min={1}
                  value={draft.equipmentFactors.monthlyHours}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      equipmentFactors: {
                        ...prev.equipmentFactors,
                        monthlyHours: Math.max(1, Number(e.target.value) || 1),
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Name</th>
                    <th>Hourly rate</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {draft.equipment.map((row, index) => (
                    <tr key={`${row.name}-${index}`}>
                      <td>
                        <input
                          value={row.class}
                          onChange={(e) =>
                            updateEquipment(index, { class: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={row.name}
                          onChange={(e) =>
                            updateEquipment(index, { name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={row.hourlyRate}
                          onChange={(e) =>
                            updateEquipment(index, {
                              hourlyRate: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => removeEquipmentRow(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === "templates" ? (
          <section className="section">
            <h3>Download templates</h3>
            <p className="hint">
              Use these CSV headers when preparing updates in Excel or Sheets.
              Example rows are included.
            </p>
            <div className="template-grid">
              <article className="template-card">
                <h4>Per diem &amp; COL</h4>
                <p className="hint">
                  Columns: <code>name,abbr,lodging,meals,colIndex</code>
                </p>
                <div className="section-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "perdiem-col-template.csv",
                        emptyStateTemplateCsv(),
                        "text/csv",
                      )
                    }
                  >
                    Blank template
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "perdiem-col-current.csv",
                        statesToCsv(draft.states),
                        "text/csv",
                      )
                    }
                  >
                    Export current
                  </button>
                </div>
              </article>

              <article className="template-card">
                <h4>Wage rates</h4>
                <p className="hint">
                  Columns:{" "}
                  <code>category,wageYr,wageHr,stPrice,otPrice,st5ot,st10ot</code>
                </p>
                <div className="section-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "wage-rates-template.csv",
                        emptyWageTemplateCsv(),
                        "text/csv",
                      )
                    }
                  >
                    Blank template
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "wage-rates-current.csv",
                        wagesToCsv(draft.wages),
                        "text/csv",
                      )
                    }
                  >
                    Export current
                  </button>
                </div>
              </article>

              <article className="template-card">
                <h4>Equipment rates</h4>
                <p className="hint">
                  Columns: <code>class,name,hourlyRate</code>
                </p>
                <div className="section-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "equipment-rates-template.csv",
                        emptyEquipmentTemplateCsv(),
                        "text/csv",
                      )
                    }
                  >
                    Blank template
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "equipment-rates-current.csv",
                        equipmentToCsv(draft.equipment),
                        "text/csv",
                      )
                    }
                  >
                    Export current
                  </button>
                </div>
              </article>

              <article className="template-card">
                <h4>Full reference JSON</h4>
                <p className="hint">
                  Complete <code>reference.json</code> for repo commits or full
                  restore.
                </p>
                <div className="section-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "reference.json",
                        `${JSON.stringify(draft, null, 2)}\n`,
                        "application/json",
                      )
                    }
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      downloadTextFile(
                        "reference-defaults.json",
                        `${JSON.stringify(getDefaultReference(), null, 2)}\n`,
                        "application/json",
                      )
                    }
                  >
                    Export bundled defaults
                  </button>
                </div>
              </article>
            </div>

            <h3 style={{ marginTop: "1.25rem" }}>Import file</h3>
            <p className="hint">
              Import replaces the matching section in the draft. Click{" "}
              <strong>Save changes</strong> to apply.
            </p>
            <div className="grid grid-3">
              <div className="field">
                <label htmlFor="importKind">Import type</label>
                <select
                  id="importKind"
                  value={importKind}
                  onChange={(e) =>
                    setImportKind(
                      e.target.value as "wages" | "states" | "equipment" | "json",
                    )
                  }
                >
                  <option value="states">Per diem &amp; COL CSV</option>
                  <option value="wages">Wage rates CSV</option>
                  <option value="equipment">Equipment rates CSV</option>
                  <option value="json">Full reference JSON</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: "span 2" }}>
                <label htmlFor="importFile">Choose file</label>
                <input
                  id="importFile"
                  ref={fileInputRef}
                  type="file"
                  accept={
                    importKind === "json" ? "application/json,.json" : ".csv,text/csv"
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onImportFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
