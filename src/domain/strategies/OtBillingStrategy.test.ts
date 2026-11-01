import { describe, expect, it } from "vitest";
import {
  FiveOtContingencyBilling,
  SeparateOtBilling,
  TenOtContingencyBilling,
  otBillingStrategyFor,
} from "./OtBillingStrategy";

const rates = {
  stPrice: 100,
  otPrice: 150,
  st5ot: 110,
  st10ot: 120,
};

describe("OtBillingStrategy (polymorphism)", () => {
  it("bills ST and OT separately", () => {
    expect(new SeparateOtBilling().resolve(rates)).toEqual({
      billedSt: 100,
      billedOt: 150,
    });
  });

  it("uses 5OT contingency blend", () => {
    expect(new FiveOtContingencyBilling().resolve(rates)).toEqual({
      billedSt: 110,
      billedOt: 0,
    });
  });

  it("uses 10OT contingency blend", () => {
    expect(new TenOtContingencyBilling().resolve(rates)).toEqual({
      billedSt: 120,
      billedOt: 0,
    });
  });

  it("factory returns matching strategy per OT structure", () => {
    expect(otBillingStrategyFor("OT Billed Separately")).toBeInstanceOf(
      SeparateOtBilling,
    );
    expect(
      otBillingStrategyFor("40ST + 5OT Labor Contingency"),
    ).toBeInstanceOf(FiveOtContingencyBilling);
    expect(
      otBillingStrategyFor("40ST + 10OT Labor Contingency"),
    ).toBeInstanceOf(TenOtContingencyBilling);
  });
});
