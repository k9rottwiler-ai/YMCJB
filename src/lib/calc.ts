/**
 * Compatibility façade over the OOP domain layer.
 * Existing components keep importing from here; behavior is unchanged.
 */
import { ReferenceCatalog } from "../catalogs/ReferenceCatalog";
import { EstimateCalculator } from "../services/EstimateCalculator";
import { EstimateFactory } from "../services/EstimateFactory";
import { money, pct } from "../formatting/Formatters";
import type { EstimateInput } from "../domain/entities/Estimate";
import type { ComputedEstimateSnapshot } from "../domain/results/ComputedEstimate";
import type { OtStructure } from "../domain/valueObjects/OtStructure";
import type { ProfitTier } from "../domain/valueObjects/ProfitTier";
import type { PersonnelSlotData } from "../domain/entities/PersonnelSlot";
import { PersonnelSlot } from "../domain/entities/PersonnelSlot";

const catalog = ReferenceCatalog.getInstance();
const factory = new EstimateFactory(catalog);
const calculator = new EstimateCalculator(catalog);

export const PROFIT_TIERS = catalog.profitTiers as ProfitTier[];
export const OT_STRUCTURES = catalog.otStructures as OtStructure[];
export const STATES = catalog.states;
export const EQUIPMENT_CATALOG = catalog.equipment;
export const STANDARD_TERMS = catalog.standardTerms as string[];

export function createEmptyPersonnel(): PersonnelSlotData[] {
  return PersonnelSlot.emptySlots().map((s) => s.toJSON());
}

export function createDefaultEstimate(): EstimateInput {
  return factory.createEmpty();
}

export function createDemoEstimate(): EstimateInput {
  return factory.createDemo();
}

export function computeEstimate(input: EstimateInput): ComputedEstimateSnapshot {
  return calculator.compute(input);
}

export function salaryOptions(): number[] {
  return catalog.salaryOptions();
}

export { money, pct };
