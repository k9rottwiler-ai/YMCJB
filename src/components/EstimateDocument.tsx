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
  const isFixed = input.templateType === "fixed";
  const isUnit = input.templateType === "unit";
  const extras = computed.extras;
  const totals = computed.fixedTotals;
  const unitTotals = computed.unitTotals;

  const title = isFixed
    ? "Job Estimate — Fixed Price | Not to Exceed"
    : isUnit
      ? "Job Estimate — Unit Price"
      : "Job Estimate — Time and Equipment";

  return (
    <article className="doc" id="estimate-document">
      <h1 className="doc-title">{title}</h1>

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
        {isUnit ? (
          <div>
            <strong>Productivity factor:</strong>{" "}
            {(unitTotals.productivityFactor * 100).toFixed(0)}%
          </div>
        ) : (
          <div>
            <strong>OT structure:</strong> {input.otStructure}
          </div>
        )}
        {isFixed ? (
          <div>
            <strong>Estimate risk:</strong>{" "}
            {input.estimateRiskPct === "" ? "—" : `${input.estimateRiskPct}%`}{" "}
            (factor {totals.riskFactor.toFixed(2)})
          </div>
        ) : null}
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

      {isUnit ? (
        <section className="doc-block">
          <h4>Unit schedule</h4>
          {unitTotals.units.length === 0 ? (
            <p className="empty">No unit activities entered.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Activity</th>
                  <th>Unit ID</th>
                  <th>Description</th>
                  <th>UOM</th>
                  <th>Manpower</th>
                  <th>Equipment</th>
                  <th>Unit rate</th>
                </tr>
              </thead>
              <tbody>
                {unitTotals.units.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.activity || "—"}</td>
                    <td>{row.unitId || "—"}</td>
                    <td>{row.description || "—"}</td>
                    <td>{row.uom || "—"}</td>
                    <td>{money(row.manpowerPrice)}</td>
                    <td>{money(row.equipmentPrice)}</td>
                    <td>
                      <strong>{money(row.unitPrice)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      <section className="doc-block">
        <h4>{isUnit ? "Crew (rate basis)" : "Personnel"}</h4>
        {computed.personnel.length === 0 ? (
          <p className="empty">No personnel selected.</p>
        ) : isFixed ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Name</th>
                <th>Role</th>
                <th>Weeks</th>
                <th>Adj. hours</th>
                <th>Rate</th>
                <th>Estimate</th>
              </tr>
            </thead>
            <tbody>
              {computed.personnel.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.name || "—"}</td>
                  <td>{row.role || "—"}</td>
                  <td>{row.estimatedWeeks || "—"}</td>
                  <td>{row.adjustedHours ? row.adjustedHours.toFixed(1) : "—"}</td>
                  <td>{money(row.nteRate)}/hr</td>
                  <td>{money(row.estimateAmount)}</td>
                </tr>
              ))}
              <tr>
                <th colSpan={6} style={{ textAlign: "right" }}>
                  Personnel total
                </th>
                <td>
                  <strong>{money(totals.personnelTotal)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        ) : isUnit ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Name</th>
                <th>Role</th>
                <th>Qty</th>
                <th>40ST + 5OT</th>
              </tr>
            </thead>
            <tbody>
              {computed.personnel.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.name || "—"}</td>
                  <td>{row.role || "—"}</td>
                  <td>{row.quantity || "—"}</td>
                  <td>{money(row.st5ot)}/hr</td>
                </tr>
              ))}
              <tr>
                <th colSpan={4} style={{ textAlign: "right" }}>
                  Blended labor
                </th>
                <td>
                  <strong>{money(unitTotals.laborPerMin * 60, 2)}/hr</strong>
                  <div className="muted">
                    {money(unitTotals.laborPerMin, 4)}/min
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
        ) : isFixed ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Weeks</th>
                <th>Weekly</th>
                <th>Estimate</th>
              </tr>
            </thead>
            <tbody>
              {computed.equipment.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>{row.estimatedWeeks || "—"}</td>
                  <td>{money(row.weekly, 2)}</td>
                  <td>{money(row.estimateAmount)}</td>
                </tr>
              ))}
              <tr>
                <th colSpan={5} style={{ textAlign: "right" }}>
                  Equipment total
                </th>
                <td>
                  <strong>{money(totals.equipmentTotal)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        ) : isUnit ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Equipment</th>
                <th>Qty</th>
                <th>Hourly (COL adj.)</th>
              </tr>
            </thead>
            <tbody>
              {computed.equipment.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>{money(row.adjustedHourly, 2)}</td>
                </tr>
              ))}
              <tr>
                <th colSpan={3} style={{ textAlign: "right" }}>
                  Blended equipment
                </th>
                <td>
                  <strong>{money(unitTotals.equipmentPerMin * 60, 2)}/hr</strong>
                  <div className="muted">
                    {money(unitTotals.equipmentPerMin, 4)}/min
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
              {isFixed ? (
                <>
                  <th>Qty / units</th>
                  <th>Weeks</th>
                  <th>Estimate</th>
                </>
              ) : (
                <>
                  <th>Daily</th>
                  <th>Weekly</th>
                  <th>Monthly</th>
                </>
              )}
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
                    {isFixed ? (
                      <>
                        <td>{computed.perDiem.lodgingRooms || "—"} rooms</td>
                        <td>{computed.perDiem.lodgingWeeks || "—"}</td>
                        <td>{money(computed.perDiem.lodgingAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td>{money(computed.perDiem.lodgingDaily)}</td>
                        <td>{money(computed.perDiem.lodgingWeekly)}</td>
                        <td>{money(computed.perDiem.lodgingMonthly)}</td>
                      </>
                    )}
                  </tr>,
                );
              }
              if (input.includeMeals) {
                itemNo += 1;
                rows.push(
                  <tr key="meals">
                    <td>A{itemNo}</td>
                    <td>Meals and Incidentals</td>
                    {isFixed ? (
                      <>
                        <td>{computed.perDiem.mealsEmployees || "—"} employees</td>
                        <td>{computed.perDiem.mealsWeeks || "—"}</td>
                        <td>{money(computed.perDiem.mealsAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td>{money(computed.perDiem.mealsDaily)}</td>
                        <td>{money(computed.perDiem.mealsWeekly)}</td>
                        <td>{money(computed.perDiem.mealsMonthly)}</td>
                      </>
                    )}
                  </tr>,
                );
              }
              for (const [index, row] of extras.entries()) {
                itemNo += 1;
                rows.push(
                  <tr key={`${row.label}-${index}`}>
                    <td>A{itemNo}</td>
                    <td>
                      {row.label}
                      {row.notes ? (
                        <div className="muted">{row.notes}</div>
                      ) : null}
                    </td>
                    {isFixed ? (
                      <>
                        <td colSpan={2}>As approved</td>
                        <td>{row.amount ? money(row.amount) : "As approved"}</td>
                      </>
                    ) : (
                      <td colSpan={3}>As approved</td>
                    )}
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

      {isFixed ? (
        <section className="doc-block">
          <h4>Estimate summary</h4>
          <table>
            <tbody>
              <tr>
                <th style={{ width: "55%" }}>Personnel</th>
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
              {totals.extrasTotal > 0 ? (
                <tr>
                  <th>Additional items</th>
                  <td>{money(totals.extrasTotal)}</td>
                </tr>
              ) : null}
              <tr>
                <th>Subtotal</th>
                <td>{money(totals.subtotal)}</td>
              </tr>
              <tr>
                <th>
                  Completion bonus / contingency (
                  {(totals.contingencyPct * 100).toFixed(1)}%)
                </th>
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
      ) : null}

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

      <section className="doc-block signatures-block">
        <h4>Authorization signatures</h4>
        <p className="signatures-intro">
          By signing below, each party acknowledges review of this estimate and
          agrees to the{" "}
          {isFixed
            ? "not-to-exceed price, scope, and terms"
            : isUnit
              ? "unit rates, scope, and terms"
              : "rates, scope, and terms"}{" "}
          stated herein, subject to any written amendments.
        </p>
        <div className="signatures-grid">
          <div className="signature-col">
            <div className="signature-party">Contractor / Provider</div>
            <div className="signature-line">
              <span>Signature</span>
            </div>
            <div className="signature-line">
              <span>Printed name</span>
              <strong className="signature-prefill">
                {input.estimatorName || "\u00a0"}
              </strong>
            </div>
            <div className="signature-line">
              <span>Title</span>
            </div>
            <div className="signature-line">
              <span>Date</span>
            </div>
          </div>
          <div className="signature-col">
            <div className="signature-party">Customer / Client</div>
            <div className="signature-line">
              <span>Signature</span>
            </div>
            <div className="signature-line">
              <span>Printed name</span>
              <strong className="signature-prefill">
                {input.customerName || "\u00a0"}
              </strong>
            </div>
            <div className="signature-line">
              <span>Title</span>
            </div>
            <div className="signature-line">
              <span>Date</span>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
