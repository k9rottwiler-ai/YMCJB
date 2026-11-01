import type { OtStructure } from "../valueObjects/OtStructure";

/** Wage-schedule rate columns used when resolving billed ST/OT. */
export type WageRates = {
  stPrice: number;
  otPrice: number;
  st5ot: number;
  st10ot: number;
};

export type BilledRates = {
  billedSt: number;
  billedOt: number;
};

/**
 * Abstraction (Strategy): how OT structure maps wage rows to billed rates.
 * Concrete strategies provide polymorphic behavior without estimate branching.
 */
export interface OtBillingStrategy {
  readonly structure: OtStructure;
  resolve(rates: WageRates): BilledRates;
}

export class SeparateOtBilling implements OtBillingStrategy {
  readonly structure = "OT Billed Separately" as const;

  resolve(rates: WageRates): BilledRates {
    return { billedSt: rates.stPrice, billedOt: rates.otPrice };
  }
}

export class FiveOtContingencyBilling implements OtBillingStrategy {
  readonly structure = "40ST + 5OT Labor Contingency" as const;

  resolve(rates: WageRates): BilledRates {
    return { billedSt: rates.st5ot, billedOt: 0 };
  }
}

export class TenOtContingencyBilling implements OtBillingStrategy {
  readonly structure = "40ST + 10OT Labor Contingency" as const;

  resolve(rates: WageRates): BilledRates {
    return { billedSt: rates.st10ot, billedOt: 0 };
  }
}

/** Factory: pick the strategy for a given OT structure (polymorphism entry point). */
export function otBillingStrategyFor(
  structure: OtStructure,
): OtBillingStrategy {
  switch (structure) {
    case "OT Billed Separately":
      return new SeparateOtBilling();
    case "40ST + 5OT Labor Contingency":
      return new FiveOtContingencyBilling();
    case "40ST + 10OT Labor Contingency":
      return new TenOtContingencyBilling();
  }
}
