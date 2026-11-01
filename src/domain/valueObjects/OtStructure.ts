/** Value object: overtime billing structure selected on the estimate. */
export type OtStructure =
  | "OT Billed Separately"
  | "40ST + 5OT Labor Contingency"
  | "40ST + 10OT Labor Contingency";

export const OT_STRUCTURE_VALUES: readonly OtStructure[] = [
  "OT Billed Separately",
  "40ST + 5OT Labor Contingency",
  "40ST + 10OT Labor Contingency",
] as const;
