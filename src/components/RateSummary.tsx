import { money, pct } from "../lib/calc";
import type { ComputedEstimate, EstimateInput } from "../lib/types";

type Props = {
  input: EstimateInput;
  computed: ComputedEstimate;
};

export function RateSummary({ input, computed }: Props) {
  const isFixed = input.templateType === "fixed";
  const isUnit = input.templateType === "unit";
  const totals = computed.fixedTotals;
  const unitTotals = computed.unitTotals;

  if (isFixed) {
    return (
      <div className="summary-grid panel-body">
        <section className="summary-card">
          <h4>Fixed Price summary</h4>
          <table className="doc" style={{ border: "none" }}>
            <tbody>
              <tr>
                <th>Personnel</th>
                <td>{money(totals.personnelTotal)}</td>
              </tr>
              <tr>
                <th>Equipment</th>
                <td>{money(totals.equipmentTotal)}</td>
              </tr>
              <tr>
                <th>Lodging &amp; meals</th>
                <td>{money(totals.lodgingMealsTotal)}</td>
              </tr>
              <tr>
                <th>Additional items</th>
                <td>{money(totals.extrasTotal)}</td>
              </tr>
              <tr>
                <th>Subtotal</th>
                <td>{money(totals.subtotal)}</td>
              </tr>
              <tr>
                <th>Contingency ({(totals.contingencyPct * 100).toFixed(1)}%)</th>
                <td>{money(totals.contingencyAmount)}</td>
              </tr>
              <tr>
                <th>Grand total (NTE)</th>
                <td>
                  <strong>{money(totals.grandTotal)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="summary-card">
          <h4>Risk &amp; COL</h4>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Estimate risk factor:</strong> {totals.riskFactor.toFixed(2)}
          </p>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>COL adj:</strong> {pct(computed.colDelta)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>OT structure:</strong> {input.otStructure}
          </p>
        </section>

        <section className="summary-card">
          <h4>Personnel NTE lines</h4>
          {computed.personnel.length === 0 ? (
            <p className="empty">Add personnel with weeks to see amounts.</p>
          ) : (
            <table className="doc" style={{ border: "none" }}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Adj. hours</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {computed.personnel.map((row) => (
                  <tr key={row.item}>
                    <td>{row.role || row.name || row.item}</td>
                    <td>{row.adjustedHours.toFixed(1)}</td>
                    <td>{money(row.estimateAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="summary-card">
          <h4>Project</h4>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Location:</strong> {input.projectState || "—"}
          </p>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            <strong>Scope:</strong> {input.projectScope || "—"}
          </p>
        </section>
      </div>
    );
  }

  if (isUnit) {
    return (
      <div className="summary-grid panel-body">
        <section className="summary-card">
          <h4>Unit rates</h4>
          {unitTotals.units.length === 0 ? (
            <p className="empty">Add unit activities to see priced rates.</p>
          ) : (
            <table className="doc" style={{ border: "none" }}>
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {unitTotals.units.map((row) => (
                  <tr key={row.item}>
                    <td>{row.unitId || row.item}</td>
                    <td>{row.description || row.activity || "—"}</td>
                    <td>{row.uom || "—"}</td>
                    <td>{money(row.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="summary-card">
          <h4>Blend factors</h4>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Productivity:</strong>{" "}
            {(unitTotals.productivityFactor * 100).toFixed(0)}%
          </p>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Labor $/min:</strong> {money(unitTotals.laborPerMin, 4)}
          </p>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Equipment $/min:</strong>{" "}
            {money(unitTotals.equipmentPerMin, 4)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>COL adj:</strong> {pct(computed.colDelta)}
          </p>
        </section>

        <section className="summary-card">
          <h4>Lodging &amp; meals</h4>
          <table className="doc" style={{ border: "none" }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Daily</th>
                <th>Weekly</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lodging</td>
                <td>{money(computed.perDiem.lodgingDaily)}</td>
                <td>{money(computed.perDiem.lodgingWeekly)}</td>
              </tr>
              <tr>
                <td>Meals and Incidentals</td>
                <td>{money(computed.perDiem.mealsDaily)}</td>
                <td>{money(computed.perDiem.mealsWeekly)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="summary-card">
          <h4>Project</h4>
          <p style={{ margin: "0 0 0.35rem" }}>
            <strong>Location:</strong> {input.projectState || "—"}
          </p>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            <strong>Scope:</strong> {input.projectScope || "—"}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="summary-grid panel-body">
      <section className="summary-card">
        <h4>Personnel rates</h4>
        {computed.personnel.length === 0 ? (
          <p className="empty">Add personnel on the form to see rates.</p>
        ) : (
          <table className="doc" style={{ border: "none" }}>
            <thead>
              <tr>
                <th>Role</th>
                <th>Straight time</th>
                <th>Overtime</th>
              </tr>
            </thead>
            <tbody>
              {computed.personnel.map((row) => (
                <tr key={row.item}>
                  <td>{row.role || row.name || row.item}</td>
                  <td>{money(row.billedSt)}/hr</td>
                  <td>
                    {input.otStructure === "OT Billed Separately"
                      ? `${money(row.billedOt)}/hr`
                      : "Included"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="summary-card">
        <h4>Equipment rates</h4>
        {computed.equipment.length === 0 ? (
          <p className="empty">Add equipment quantities to see rates.</p>
        ) : (
          <table className="doc" style={{ border: "none" }}>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Daily</th>
                <th>Weekly</th>
              </tr>
            </thead>
            <tbody>
              {computed.equipment.map((row) => (
                <tr key={row.item}>
                  <td>
                    {row.name}
                    {row.count > 1 ? ` ×${row.count}` : ""}
                  </td>
                  <td>{money(row.daily, 2)}</td>
                  <td>{money(row.weekly, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="summary-card">
        <h4>Lodging &amp; meals</h4>
        <table className="doc" style={{ border: "none" }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Daily</th>
              <th>Weekly</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lodging</td>
              <td>{money(computed.perDiem.lodgingDaily)}</td>
              <td>{money(computed.perDiem.lodgingWeekly)}</td>
            </tr>
            <tr>
              <td>Meals and Incidentals</td>
              <td>{money(computed.perDiem.mealsDaily)}</td>
              <td>{money(computed.perDiem.mealsWeekly)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="summary-card">
        <h4>Project</h4>
        <p style={{ margin: "0 0 0.35rem" }}>
          <strong>Location:</strong> {input.projectState || "—"}
        </p>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          <strong>Scope:</strong> {input.projectScope || "—"}
        </p>
      </section>
    </div>
  );
}
