/**
 * OOP domain barrel — organized by classic OOP concepts:
 *
 * Encapsulation  → entities, value objects, ReferenceCatalog
 * Inheritance    → LineItem → PersonnelLine / EquipmentLine
 * Polymorphism   → OtBillingStrategy implementations
 * Abstraction    → LineItem, OtBillingStrategy, services / storage
 */
export { ColAdjustment } from "./valueObjects/ColAdjustment";
export type { ProfitTier } from "./valueObjects/ProfitTier";
export type { OtStructure } from "./valueObjects/OtStructure";

export { PersonnelSlot } from "./entities/PersonnelSlot";
export { Estimate } from "./entities/Estimate";
export type { EstimateInput } from "./entities/Estimate";

export { LineItem } from "./lineItems/LineItem";
export { PersonnelLine } from "./lineItems/PersonnelLine";
export { EquipmentLine } from "./lineItems/EquipmentLine";

export {
  otBillingStrategyFor,
  SeparateOtBilling,
  FiveOtContingencyBilling,
  TenOtContingencyBilling,
} from "./strategies/OtBillingStrategy";
export type { OtBillingStrategy } from "./strategies/OtBillingStrategy";

export { PerDiemRates } from "./results/PerDiemRates";
export { ComputedEstimate } from "./results/ComputedEstimate";
