import { money } from "../lib/calc";
import type { ComputedEstimate, EstimateInput } from "../lib/types";

type Props = {
  input: EstimateInput;
  computed: ComputedEstimate;
};

export function RateSummary({ input, computed }: Props) {
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
