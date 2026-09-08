import type {
  EquipmentSlot,
  EstimateInput,
  ExtraItem,
  PersonnelSlot,
  TemplateType,
} from "../lib/types";
import {
  EQUIPMENT_CATALOG,
  EXTRA_ITEM_PRESETS,
  OT_STRUCTURES,
  PROFIT_TIERS,
  STATES,
  emptyEquipmentSlot,
  emptyExtraItem,
  emptyPersonnelSlot,
  salaryOptions,
  switchTemplateType,
} from "../lib/calc";

type Props = {
  value: EstimateInput;
  onChange: (next: EstimateInput) => void;
};

function updateField<K extends keyof EstimateInput>(
  value: EstimateInput,
  onChange: Props["onChange"],
  key: K,
  next: EstimateInput[K],
) {
  onChange({ ...value, [key]: next });
}

function updatePersonnel(
  value: EstimateInput,
  onChange: Props["onChange"],
  index: number,
  patch: Partial<PersonnelSlot>,
) {
  const personnel = value.personnel.map((row, i) =>
    i === index ? { ...row, ...patch } : row,
  );
  onChange({ ...value, personnel });
}

function updateEquipment(
  value: EstimateInput,
  onChange: Props["onChange"],
  index: number,
  patch: Partial<EquipmentSlot>,
) {
  const equipmentRows = value.equipmentRows.map((row, i) =>
    i === index ? { ...row, ...patch } : row,
  );
  onChange({ ...value, equipmentRows });
}

function updateExtraItem(
  value: EstimateInput,
  onChange: Props["onChange"],
  index: number,
  patch: Partial<ExtraItem>,
) {
  const extraItems = value.extraItems.map((row, i) =>
    i === index ? { ...row, ...patch } : row,
  );
  onChange({ ...value, extraItems });
}

function parseOptionalNumber(raw: string): number | "" {
  if (raw === "") return "";
  return Math.max(0, Number(raw) || 0);
}

export function EstimateForm({ value, onChange }: Props) {
  const salaries = salaryOptions();
  const catalogNames = new Set(EQUIPMENT_CATALOG.map((eq) => eq.name));
  const isFixed = value.templateType === "fixed";

  return (
    <div className="panel-body">
      <section className="section">
        <h3>Template</h3>
        <div className="template-switch" role="group" aria-label="Estimate template">
          {(
            [
              ["te", "Time & Equipment"],
              ["fixed", "Fixed Price"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`template-btn ${value.templateType === id ? "active" : ""}`}
              onClick={() =>
                onChange(switchTemplateType(value, id as TemplateType))
              }
            >
              {label}
            </button>
          ))}
        </div>
        <p className="hint">
          {isFixed
            ? "Fixed Price builds a not-to-exceed total from weeks, estimate risk, and contingency — matching the Fixed Price Excel workbook."
            : "Time & Equipment publishes unit rates for labor, equipment, and per diem without a locked grand total."}
        </p>
      </section>

      <section className="section">
        <h3>Estimator</h3>
        <div className="grid grid-3">
          <div className="field">
            <label htmlFor="estimatorName">Your name</label>
            <input
              id="estimatorName"
              value={value.estimatorName}
              onChange={(e) =>
                updateField(value, onChange, "estimatorName", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="estimatorPhone">Phone</label>
            <input
              id="estimatorPhone"
              value={value.estimatorPhone}
              onChange={(e) =>
                updateField(value, onChange, "estimatorPhone", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="estimatorEmail">Email</label>
            <input
              id="estimatorEmail"
              type="email"
              value={value.estimatorEmail}
              onChange={(e) =>
                updateField(value, onChange, "estimatorEmail", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h3>Estimate details</h3>
        <div className="grid grid-3">
          <div className="field">
            <label htmlFor="estimateDate">Estimate date</label>
            <input
              id="estimateDate"
              type="date"
              value={value.estimateDate}
              onChange={(e) =>
                updateField(value, onChange, "estimateDate", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="estimateNumber">Estimate number</label>
            <input
              id="estimateNumber"
              value={value.estimateNumber}
              onChange={(e) =>
                updateField(value, onChange, "estimateNumber", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="otStructure">OT rate structure</label>
            <select
              id="otStructure"
              value={value.otStructure}
              onChange={(e) =>
                updateField(
                  value,
                  onChange,
                  "otStructure",
                  e.target.value as EstimateInput["otStructure"],
                )
              }
            >
              {OT_STRUCTURES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="stProfit">ST profit tier</label>
            <select
              id="stProfit"
              value={value.stProfit}
              onChange={(e) =>
                updateField(
                  value,
                  onChange,
                  "stProfit",
                  e.target.value as EstimateInput["stProfit"],
                )
              }
            >
              {PROFIT_TIERS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="otProfit">OT profit tier</label>
            <select
              id="otProfit"
              value={value.otProfit}
              onChange={(e) =>
                updateField(
                  value,
                  onChange,
                  "otProfit",
                  e.target.value as EstimateInput["otProfit"],
                )
              }
            >
              {PROFIT_TIERS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="baseState">Base state (COL)</label>
            <select
              id="baseState"
              value={value.baseState}
              onChange={(e) =>
                updateField(value, onChange, "baseState", e.target.value)
              }
            >
              {STATES.map((s) => (
                <option key={s.abbr} value={s.name}>
                  {s.name} ({s.colIndex})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="projectState">Project state</label>
            <select
              id="projectState"
              value={value.projectState}
              onChange={(e) =>
                updateField(value, onChange, "projectState", e.target.value)
              }
            >
              {STATES.map((s) => (
                <option key={s.abbr} value={s.name}>
                  {s.name} ({s.colIndex})
                </option>
              ))}
            </select>
          </div>
          {isFixed ? (
            <>
              <div className="field">
                <label htmlFor="estimateRiskPct">Estimate risk (%)</label>
                <input
                  id="estimateRiskPct"
                  type="number"
                  min={0}
                  step={0.1}
                  value={value.estimateRiskPct}
                  onChange={(e) =>
                    updateField(
                      value,
                      onChange,
                      "estimateRiskPct",
                      parseOptionalNumber(e.target.value),
                    )
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="contingencyPct">
                  Completion bonus / contingency (%)
                </label>
                <input
                  id="contingencyPct"
                  type="number"
                  min={0}
                  step={0.1}
                  value={value.contingencyPct}
                  onChange={(e) =>
                    updateField(
                      value,
                      onChange,
                      "contingencyPct",
                      parseOptionalNumber(e.target.value),
                    )
                  }
                />
              </div>
            </>
          ) : null}
        </div>
        {isFixed ? (
          <p className="hint">
            Risk inflates hours/weeks (× 1 + risk%). Contingency is applied to
            the estimate subtotal. Prefer a blended OT contingency structure for
            Fixed Price NTE labor rates.
          </p>
        ) : null}
      </section>

      <section className="section">
        <h3>Customer information</h3>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="customerName">Customer name</label>
            <input
              id="customerName"
              value={value.customerName}
              onChange={(e) =>
                updateField(value, onChange, "customerName", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="projectAddress">Project address</label>
            <input
              id="projectAddress"
              value={value.projectAddress}
              onChange={(e) =>
                updateField(value, onChange, "projectAddress", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="clientPhone">Client phone</label>
            <input
              id="clientPhone"
              value={value.clientPhone}
              onChange={(e) =>
                updateField(value, onChange, "clientPhone", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="clientEmail">Client email</label>
            <input
              id="clientEmail"
              type="email"
              value={value.clientEmail}
              onChange={(e) =>
                updateField(value, onChange, "clientEmail", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h3>Job description</h3>
        <div className="field">
          <label htmlFor="projectScope">Project scope</label>
          <textarea
            id="projectScope"
            value={value.projectScope}
            onChange={(e) =>
              updateField(value, onChange, "projectScope", e.target.value)
            }
          />
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="mobilizationDate">Estimated mobilization</label>
            <input
              id="mobilizationDate"
              type="date"
              value={value.mobilizationDate}
              onChange={(e) =>
                updateField(value, onChange, "mobilizationDate", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="startDate">Estimated start</label>
            <input
              id="startDate"
              type="date"
              value={value.startDate}
              onChange={(e) =>
                updateField(value, onChange, "startDate", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="finishDate">Estimated finish</label>
            <input
              id="finishDate"
              type="date"
              value={value.finishDate}
              onChange={(e) =>
                updateField(value, onChange, "finishDate", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="closeOutDate">Estimated close-out</label>
            <input
              id="closeOutDate"
              type="date"
              value={value.closeOutDate}
              onChange={(e) =>
                updateField(value, onChange, "closeOutDate", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h3>Personnel</h3>
            <p className="hint">
              {isFixed
                ? "Add manpower lines with estimated weeks. Hours = weeks × 40, then risk-adjusted for the NTE amount."
                : "Add manpower lines as needed. Salary selects from the wage schedule; COL adjusts to the nearest $5,000 band."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-small"
            onClick={() =>
              onChange({
                ...value,
                personnel: [...value.personnel, emptyPersonnelSlot()],
              })
            }
          >
            Add personnel
          </button>
        </div>
        <div className="grid">
          {value.personnel.map((slot, index) => (
            <div
              className={`person-row ${isFixed ? "person-row-fixed" : ""}`}
              key={index}
            >
              <div className="field">
                <label htmlFor={`role-${index}`}>Role (M{index + 1})</label>
                <input
                  id={`role-${index}`}
                  value={slot.role}
                  placeholder="e.g. Superintendent"
                  onChange={(e) =>
                    updatePersonnel(value, onChange, index, {
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`name-${index}`}>Resource name</label>
                <input
                  id={`name-${index}`}
                  value={slot.name}
                  placeholder="Optional"
                  onChange={(e) =>
                    updatePersonnel(value, onChange, index, {
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`salary-${index}`}>Salary (yr)</label>
                <select
                  id={`salary-${index}`}
                  value={slot.salary === "" ? "" : String(slot.salary)}
                  onChange={(e) =>
                    updatePersonnel(value, onChange, index, {
                      salary:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                >
                  <option value="">—</option>
                  {salaries.map((yr) => (
                    <option key={yr} value={yr}>
                      ${yr.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              {isFixed ? (
                <div className="field">
                  <label htmlFor={`weeks-${index}`}>Estimated weeks</label>
                  <input
                    id={`weeks-${index}`}
                    type="number"
                    min={0}
                    step={0.25}
                    value={slot.estimatedWeeks}
                    onChange={(e) =>
                      updatePersonnel(value, onChange, index, {
                        estimatedWeeks: parseOptionalNumber(e.target.value),
                      })
                    }
                  />
                </div>
              ) : null}
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-small"
                  disabled={value.personnel.length <= 1}
                  onClick={() =>
                    onChange({
                      ...value,
                      personnel: value.personnel.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h3>Equipment</h3>
            <p className="hint">
              {isFixed
                ? "Add equipment with quantity and estimated weeks. NTE uses COL-adjusted weekly rate × qty × risk-adjusted weeks."
                : "Add catalog or custom equipment lines. Custom rows need an hourly rate; catalog rates are COL-adjusted automatically."}
            </p>
          </div>
          <div className="section-actions">
            <button
              type="button"
              className="btn btn-small"
              onClick={() =>
                onChange({
                  ...value,
                  equipmentRows: [
                    ...value.equipmentRows,
                    {
                      ...emptyEquipmentSlot(),
                      name: EQUIPMENT_CATALOG[0]?.name ?? "",
                    },
                  ],
                })
              }
            >
              Add catalog item
            </button>
            <button
              type="button"
              className="btn btn-small"
              onClick={() =>
                onChange({
                  ...value,
                  equipmentRows: [
                    ...value.equipmentRows,
                    { name: "", count: 1, customHourly: 0, estimatedWeeks: "" },
                  ],
                })
              }
            >
              Add custom item
            </button>
          </div>
        </div>
        <div className="grid">
          {value.equipmentRows.length === 0 ? (
            <p className="hint">No equipment added yet.</p>
          ) : null}
          {value.equipmentRows.map((slot, index) => {
            const isCustom =
              slot.customHourly !== "" ||
              (slot.name !== "" && !catalogNames.has(slot.name));
            const catalog = EQUIPMENT_CATALOG.find((eq) => eq.name === slot.name);
            return (
              <div
                className={`equip-row ${isFixed ? "equip-row-fixed" : ""}`}
                key={index}
              >
                {isCustom ? (
                  <>
                    <div className="field">
                      <label htmlFor={`eq-name-${index}`}>
                        Custom equipment (E{index + 1})
                      </label>
                      <input
                        id={`eq-name-${index}`}
                        value={slot.name}
                        placeholder="Equipment name"
                        onChange={(e) =>
                          updateEquipment(value, onChange, index, {
                            name: e.target.value,
                            customHourly:
                              slot.customHourly === "" ? 0 : slot.customHourly,
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`eq-rate-${index}`}>Hourly rate</label>
                      <input
                        id={`eq-rate-${index}`}
                        type="number"
                        min={0}
                        step={0.01}
                        value={slot.customHourly === "" ? "" : slot.customHourly}
                        onChange={(e) =>
                          updateEquipment(value, onChange, index, {
                            customHourly:
                              e.target.value === ""
                                ? ""
                                : Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="field">
                    <label htmlFor={`eq-name-${index}`}>
                      Equipment (E{index + 1})
                    </label>
                    <select
                      id={`eq-name-${index}`}
                      value={slot.name}
                      onChange={(e) =>
                        updateEquipment(value, onChange, index, {
                          name: e.target.value,
                          customHourly: "",
                        })
                      }
                    >
                      <option value="">— Select —</option>
                      {EQUIPMENT_CATALOG.map((eq) => (
                        <option key={eq.name} value={eq.name}>
                          {eq.name} · {eq.class} · ${eq.hourlyRate}/hr
                        </option>
                      ))}
                    </select>
                    {catalog ? (
                      <div className="muted field-note">
                        Base {catalog.hourlyRate}/hr before COL
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="field">
                  <label htmlFor={`eq-qty-${index}`}>Qty</label>
                  <input
                    id={`eq-qty-${index}`}
                    type="number"
                    min={0}
                    value={slot.count}
                    onChange={(e) =>
                      updateEquipment(value, onChange, index, {
                        count: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </div>
                {isFixed ? (
                  <div className="field">
                    <label htmlFor={`eq-weeks-${index}`}>Estimated weeks</label>
                    <input
                      id={`eq-weeks-${index}`}
                      type="number"
                      min={0}
                      step={0.25}
                      value={slot.estimatedWeeks}
                      onChange={(e) =>
                        updateEquipment(value, onChange, index, {
                          estimatedWeeks: parseOptionalNumber(e.target.value),
                        })
                      }
                    />
                  </div>
                ) : null}
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() =>
                      onChange({
                        ...value,
                        equipmentRows: value.equipmentRows.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h3>Additional items</h3>
            <p className="hint">
              {isFixed
                ? "Set lodging rooms/weeks and meals employees/weeks for per-diem totals. Optional dollar amounts on extra lines roll into the NTE."
                : "Toggle lodging/meals, then add any other reimbursable lines."}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-small"
            onClick={() =>
              onChange({
                ...value,
                extraItems: [...value.extraItems, emptyExtraItem()],
              })
            }
          >
            Add item
          </button>
        </div>
        <div className="grid grid-2">
          <label className="check-row">
            <input
              type="checkbox"
              checked={value.includeLodging}
              onChange={(e) =>
                updateField(value, onChange, "includeLodging", e.target.checked)
              }
            />
            Include lodging per diem
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={value.includeMeals}
              onChange={(e) =>
                updateField(value, onChange, "includeMeals", e.target.checked)
              }
            />
            Include meals &amp; incidentals
          </label>
        </div>
        {isFixed && (value.includeLodging || value.includeMeals) ? (
          <div className="grid grid-2" style={{ marginTop: "0.75rem" }}>
            {value.includeLodging ? (
              <>
                <div className="field">
                  <label htmlFor="lodgingRooms">Lodging rooms</label>
                  <input
                    id="lodgingRooms"
                    type="number"
                    min={0}
                    value={value.lodgingRooms}
                    onChange={(e) =>
                      updateField(
                        value,
                        onChange,
                        "lodgingRooms",
                        parseOptionalNumber(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="lodgingWeeks">Lodging weeks</label>
                  <input
                    id="lodgingWeeks"
                    type="number"
                    min={0}
                    step={0.25}
                    value={value.lodgingWeeks}
                    onChange={(e) =>
                      updateField(
                        value,
                        onChange,
                        "lodgingWeeks",
                        parseOptionalNumber(e.target.value),
                      )
                    }
                  />
                </div>
              </>
            ) : null}
            {value.includeMeals ? (
              <>
                <div className="field">
                  <label htmlFor="mealsEmployees">Meals employees</label>
                  <input
                    id="mealsEmployees"
                    type="number"
                    min={0}
                    value={value.mealsEmployees}
                    onChange={(e) =>
                      updateField(
                        value,
                        onChange,
                        "mealsEmployees",
                        parseOptionalNumber(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="mealsWeeks">Meals weeks</label>
                  <input
                    id="mealsWeeks"
                    type="number"
                    min={0}
                    step={0.25}
                    value={value.mealsWeeks}
                    onChange={(e) =>
                      updateField(
                        value,
                        onChange,
                        "mealsWeeks",
                        parseOptionalNumber(e.target.value),
                      )
                    }
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        <div className="grid" style={{ marginTop: "0.75rem" }}>
          {value.extraItems.length === 0 ? (
            <p className="hint">No extra approval items added yet.</p>
          ) : null}
          {value.extraItems.map((item, index) => (
            <div
              className={`extra-row ${isFixed ? "extra-row-fixed" : ""}`}
              key={index}
            >
              <div className="field">
                <label htmlFor={`extra-label-${index}`}>Item label</label>
                <input
                  id={`extra-label-${index}`}
                  list={`extra-presets-${index}`}
                  value={item.label}
                  placeholder="e.g. Rental vehicle"
                  onChange={(e) =>
                    updateExtraItem(value, onChange, index, {
                      label: e.target.value,
                    })
                  }
                />
                <datalist id={`extra-presets-${index}`}>
                  {EXTRA_ITEM_PRESETS.map((preset) => (
                    <option key={preset} value={preset} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label htmlFor={`extra-notes-${index}`}>Notes / approval</label>
                <input
                  id={`extra-notes-${index}`}
                  value={item.notes}
                  placeholder="As needed / client prior approval"
                  onChange={(e) =>
                    updateExtraItem(value, onChange, index, {
                      notes: e.target.value,
                    })
                  }
                />
              </div>
              {isFixed ? (
                <div className="field">
                  <label htmlFor={`extra-amount-${index}`}>Amount ($)</label>
                  <input
                    id={`extra-amount-${index}`}
                    type="number"
                    min={0}
                    step={1}
                    value={item.amount}
                    onChange={(e) =>
                      updateExtraItem(value, onChange, index, {
                        amount: parseOptionalNumber(e.target.value),
                      })
                    }
                  />
                </div>
              ) : null}
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() =>
                    onChange({
                      ...value,
                      extraItems: value.extraItems.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>Terms &amp; conditions</h3>
        <div className="grid">
          <label className="check-row">
            <input
              type="checkbox"
              checked={value.includeStandByTerm}
              onChange={(e) =>
                updateField(
                  value,
                  onChange,
                  "includeStandByTerm",
                  e.target.checked,
                )
              }
            />
            Include stand-by time term
          </label>
          {!isFixed ? (
            <label className="check-row">
              <input
                type="checkbox"
                checked={value.includeHolidayTerm}
                onChange={(e) =>
                  updateField(
                    value,
                    onChange,
                    "includeHolidayTerm",
                    e.target.checked,
                  )
                }
              />
              Include federal holiday OT term
            </label>
          ) : (
            <label className="check-row">
              <input
                type="checkbox"
                checked={value.includeChangeOrderTerm}
                onChange={(e) =>
                  updateField(
                    value,
                    onChange,
                    "includeChangeOrderTerm",
                    e.target.checked,
                  )
                }
              />
              Include change-order / out-of-scope T&amp;E billing term
            </label>
          )}
        </div>
        <div className="grid">
          {value.additionalTerms.map((term, index) => (
            <div className="field" key={index}>
              <label htmlFor={`term-${index}`}>
                Additional terms or conditions — {index + 1}
              </label>
              <textarea
                id={`term-${index}`}
                value={term}
                onChange={(e) => {
                  const additionalTerms = [...value.additionalTerms];
                  additionalTerms[index] = e.target.value;
                  onChange({ ...value, additionalTerms });
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
