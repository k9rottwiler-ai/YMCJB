import type { EstimateInput, PersonnelSlot } from "../lib/types";
import {
  EQUIPMENT_CATALOG,
  OT_STRUCTURES,
  PROFIT_TIERS,
  STATES,
  salaryOptions,
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

export function EstimateForm({ value, onChange }: Props) {
  const salaries = salaryOptions();

  return (
    <div className="panel-body">
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
        </div>
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
        <h3>Personnel</h3>
        <p className="hint">
          Up to 7 resources. Salary selects from the wage schedule; COL adjusts
          to the nearest $5,000 band.
        </p>
        <div className="grid">
          {value.personnel.map((slot, index) => (
            <div className="person-row" key={index}>
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
                      salary: e.target.value === "" ? "" : Number(e.target.value),
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
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>Equipment</h3>
        <div className="grid">
          {EQUIPMENT_CATALOG.map((eq) => (
            <div className="equip-row" key={eq.name}>
              <div>
                <strong>{eq.name}</strong>
                <div className="muted" style={{ color: "var(--ink-muted)" }}>
                  {eq.class} · base {eq.hourlyRate}/hr
                </div>
              </div>
              <div className="field">
                <label htmlFor={`eq-${eq.name}`}>Qty</label>
                <input
                  id={`eq-${eq.name}`}
                  type="number"
                  min={0}
                  value={value.equipmentCounts[eq.name] ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      equipmentCounts: {
                        ...value.equipmentCounts,
                        [eq.name]: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                />
              </div>
              <div />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>Additional items</h3>
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
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="rentalVehicle">
              Rental vehicle (client prior approval)
            </label>
            <input
              id="rentalVehicle"
              value={value.rentalVehicle}
              onChange={(e) =>
                updateField(value, onChange, "rentalVehicle", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="airFare">Air fare (client prior approval)</label>
            <input
              id="airFare"
              value={value.airFare}
              onChange={(e) =>
                updateField(value, onChange, "airFare", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="rentalEquipment">
              Rental equipment (client prior approval)
            </label>
            <input
              id="rentalEquipment"
              value={value.rentalEquipment}
              onChange={(e) =>
                updateField(value, onChange, "rentalEquipment", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="supportPurchases">
              Support purchases (client prior approval)
            </label>
            <input
              id="supportPurchases"
              value={value.supportPurchases}
              onChange={(e) =>
                updateField(value, onChange, "supportPurchases", e.target.value)
              }
            />
          </div>
          <div className="field">
            <label htmlFor="backgroundScreenings">
              Background / drug screenings, memberships
            </label>
            <input
              id="backgroundScreenings"
              value={value.backgroundScreenings}
              onChange={(e) =>
                updateField(
                  value,
                  onChange,
                  "backgroundScreenings",
                  e.target.value,
                )
              }
            />
          </div>
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
