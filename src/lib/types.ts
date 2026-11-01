/**
 * Compatibility façade: re-exports domain types under the previous lib paths.
 * Prefer importing from `domain/` or `services/` in new code.
 */
export type { ProfitTier } from "../domain/valueObjects/ProfitTier";
export type { OtStructure } from "../domain/valueObjects/OtStructure";
export type {
  PersonnelSlotData as PersonnelSlot,
} from "../domain/entities/PersonnelSlot";
export type { EstimateInput } from "../domain/entities/Estimate";
export type { PersonnelLineSnapshot as ComputedPersonnel } from "../domain/lineItems/PersonnelLine";
export type { EquipmentLineSnapshot as ComputedEquipment } from "../domain/lineItems/EquipmentLine";
export type { ComputedEstimateSnapshot as ComputedEstimate } from "../domain/results/ComputedEstimate";

export type ComputedPerDiem = {
  lodgingDaily: number;
  lodgingWeekly: number;
  lodgingMonthly: number;
  mealsDaily: number;
  mealsWeekly: number;
  mealsMonthly: number;
};
