import { describe, expect, it } from "vitest";
import { ColAdjustment } from "./ColAdjustment";

describe("ColAdjustment (value object)", () => {
  it("computes delta from project vs base COL indexes", () => {
    const col = new ColAdjustment(100, 110);
    expect(col.delta).toBeCloseTo(0.1);
  });

  it("applies COL to a base rate", () => {
    const col = new ColAdjustment(100, 110);
    expect(col.apply(100)).toBeCloseTo(110);
  });

  it("ceilings adjusted salary to nearest $5,000", () => {
    const col = new ColAdjustment(100, 110);
    // 80_000 * 1.1 = 88_000 → ceiling 90_000
    expect(col.adjustSalary(80_000)).toBe(90_000);
  });

  it("returns 0 for empty salary", () => {
    expect(new ColAdjustment(100, 110).adjustSalary(0)).toBe(0);
  });
});
