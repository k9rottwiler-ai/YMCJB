import { money, pct } from "../lib/calc";
import type { ComputedEstimate, EstimateInput } from "../lib/types";

type Props = {
  input: EstimateInput;
  computed: ComputedEstimate;
};

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EstimateDocument({ input, computed }: Props) {
  const extras = input.extraItems.filter(
    (row) => row.label.trim() || row.notes.trim(),
  );

  return (
    <article className="doc" id="estimate-document">
      <h1 className="doc-title">Job Estimate — Time and Equipment</h1>

      <div className="doc-meta">
        <div>
          <strong>Date:</strong> {formatDate(input.estimateDate)}
        </div>
        <div>
          <strong>Estimate No.:</strong> {input.estimateNumber || "—"}
        </div>
        <div>
          <strong>Prepared by:</strong> {input.estimatorName || "—"}
        </div>
        <div>
          <strong>OT structure:</strong> {input.otStructure}
        </div>
      </div>

      <section className="doc-block">
        <h4>Customer information</h4>
        <table>
          <tbody>
            <tr>
              <th style={{ width: "22%" }}>Name</th>
              <td>{input.customerName || "—"}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>{input.projectAddress || "—"}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{input.clientPhone || "—"}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{input.clientEmail || "—"}</td>
            </tr>
            <tr>
              <th>Schedule</th>
              <td>
                Mobilization {formatDate(input.mobilizationDate)} · Start{" "}
                {formatDate(input.startDate)} · Finish{" "}
                {formatDate(input.finishDate)} · Close-out{" "}
                {formatDate(input.closeOutDate)}
              </td>
            </tr>
            <tr>
              <th>Location / COL</th>
              <td>
                Project {input.projectState} ({computed.projectCol}) · Base{" "}
                {input.baseState} ({computed.baseCol}) · COL adj{" "}
                {pct(computed.colDelta)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="doc-block">
        <h4>Job description</h4>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {input.projectScope || (
            <span className="muted">No scope entered.</span>
          )}
        </p>
      </section>

      <section className="doc-block">
        <h4>Personnel</h4>
        {computed.personnel.length === 0 ? (
          <p className="empty">No personnel selected.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Name</th>
                <th>Role</th>
                <th>Straight time</th>
                {input.otStructure === "OT Billed Separately" ? (
                  <th>Overtime</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {computed.personnel.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.name || "—"}</td>
                  <td>{row.role || "—"}</td>
                  <td>{money(row.billedSt)}/hr</td>
                  {input.otStructure === "OT Billed Separately" ? (
                    <td>{money(row.billedOt)}/hr</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="doc-block">
        <h4>Equipment</h4>
        {computed.equipment.length === 0 ? (
          <p className="empty">No equipment selected.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Class</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Hourly</th>
                <th>Daily</th>
                <th>Weekly</th>
              </tr>
            </thead>
            <tbody>
              {computed.equipment.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.className}</td>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>{money(row.adjustedHourly, 2)}</td>
                  <td>{money(row.daily, 2)}</td>
                  <td>{money(row.weekly, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="doc-block">
        <h4>Additional items</h4>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Daily</th>
              <th>Weekly</th>
              <th>Monthly</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let itemNo = 0;
              const rows = [];
              if (input.includeLodging) {
                itemNo += 1;
                rows.push(
                  <tr key="lodging">
                    <td>A{itemNo}</td>
                    <td>Lodging</td>
                    <td>{money(computed.perDiem.lodgingDaily)}</td>
                    <td>{money(computed.perDiem.lodgingWeekly)}</td>
                    <td>{money(computed.perDiem.lodgingMonthly)}</td>
                  </tr>,
                );
              }
              if (input.includeMeals) {
                itemNo += 1;
                rows.push(
                  <tr key="meals">
                    <td>A{itemNo}</td>
                    <td>Meals and Incidentals</td>
                    <td>{money(computed.perDiem.mealsDaily)}</td>
                    <td>{money(computed.perDiem.mealsWeekly)}</td>
                    <td>{money(computed.perDiem.mealsMonthly)}</td>
                  </tr>,
                );
              }
              for (const [index, row] of extras.entries()) {
                itemNo += 1;
                rows.push(
                  <tr key={`${row.label}-${index}`}>
                    <td>A{itemNo}</td>
                    <td>
                      {row.label.trim() || "Additional item"}
                      {row.notes.trim() ? (
                        <div className="muted">{row.notes}</div>
                      ) : null}
                    </td>
                    <td colSpan={3}>As approved</td>
                  </tr>,
                );
              }
              if (rows.length === 0) {
                rows.push(
                  <tr key="empty">
                    <td colSpan={5} className="muted">
                      No additional items.
                    </td>
                  </tr>,
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </section>

      <section className="doc-block">
        <h4>Terms &amp; conditions not previously stated</h4>
        {computed.terms.length === 0 ? (
          <p className="empty">No additional terms.</p>
        ) : (
          <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {computed.terms.map((term, index) => (
              <li key={index} style={{ marginBottom: "0.45rem" }}>
                {term}
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
