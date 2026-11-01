/** Value object: profit-tier categories used on the wage schedule. */
export type ProfitTier =
  | "MINIMUM"
  | "LOW"
  | "MILD"
  | "MED"
  | "HIGH"
  | "EXHIGH";

export const PROFIT_TIER_VALUES: readonly ProfitTier[] = [
  "MINIMUM",
  "LOW",
  "MILD",
  "MED",
  "HIGH",
  "EXHIGH",
] as const;
