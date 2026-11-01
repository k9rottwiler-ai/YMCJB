import { describe, expect, it } from "vitest";
import { Estimate } from "./Estimate";
import { EstimateFactory } from "../../services/EstimateFactory";
import { EstimateDraft } from "../../services/EstimateDraft";
import { PersonnelLine } from "../lineItems/PersonnelLine";
import { EquipmentLine } from "../lineItems/EquipmentLine";

describe("Estimate (entity + inheritance)", () => {
  const factory = new EstimateFactory();

  it("compute() prices demo personnel and equipment line items", () => {
    const result = Estimate.fromInput(factory.createDemo()).compute();
    const snap = result.toSnapshot();

    expect(result.personnelLines.length).toBe(3);
    expect(result.personnelLines[0]).toBeInstanceOf(PersonnelLine);
    expect(result.equipmentLines.length).toBe(3);
    expect(result.equipmentLines[0]).toBeInstanceOf(EquipmentLine);

    expect(snap.personnel[0]?.item).toBe("M1");
    expect(snap.personnel[0]?.billedSt).toBeGreaterThan(0);
    expect(snap.equipment.every((e) => e.count > 0)).toBe(true);
    expect(snap.colDelta).not.toBe(0); // OK base → TX project
  });

  it("switches billed OT via strategy when OT structure changes", () => {
    const demo = factory.createDemo();
    const separate = Estimate.fromInput(demo).compute().toSnapshot();

    const contingency = Estimate.fromInput({
      ...demo,
      otStructure: "40ST + 5OT Labor Contingency",
    })
      .compute()
      .toSnapshot();

    expect(separate.personnel[0]?.billedOt).toBeGreaterThan(0);
    expect(contingency.personnel[0]?.billedOt).toBe(0);
    expect(contingency.personnel[0]?.billedSt).not.toBe(
      separate.personnel[0]?.billedSt,
    );
  });
});

describe("EstimateDraft (encapsulation)", () => {
  it("patches personnel and equipment without mutating the original", () => {
    const factory = new EstimateFactory();
    const original = factory.createEmpty();
    const draft = new EstimateDraft(original);

    const next = draft.patchPersonnel(0, {
      role: "Foreman",
      salary: 95_000,
    });
    const withEq = new EstimateDraft(next).setEquipmentCount(
      "3/4 Ton 4wd Truck",
      2,
    );

    expect(original.personnel[0]?.role).toBe("");
    expect(next.personnel[0]?.role).toBe("Foreman");
    expect(withEq.equipmentCounts["3/4 Ton 4wd Truck"]).toBe(2);
    expect(original.equipmentCounts["3/4 Ton 4wd Truck"]).toBe(0);
  });
});
