import reference from "../data/reference.json";
import type { ProfitTier } from "../domain/valueObjects/ProfitTier";
import type { OtStructure } from "../domain/valueObjects/OtStructure";

export type WageRow = {
  wageYr: number;
  wageHr: number;
  category: string;
  stPrice: number;
  otPrice: number;
  st5ot: number;
  st10ot: number;
};

export type StateRow = {
  name: string;
  abbr: string;
  lodging: number;
  meals: number;
  colIndex: number;
};

export type EquipmentRow = {
  class: string;
  name: string;
  hourlyRate: number;
};

export type EquipmentFactors = {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
};

/**
 * Encapsulation / Singleton: single gateway to reference wage, state, and
 * equipment data. UI and domain code depend on this abstraction, not raw JSON.
 */
export class ReferenceCatalog {
  private static instance: ReferenceCatalog | null = null;

  readonly wages: readonly WageRow[];
  readonly states: readonly StateRow[];
  readonly equipment: readonly EquipmentRow[];
  readonly equipmentFactors: EquipmentFactors;
  readonly profitTiers: readonly ProfitTier[];
  readonly otStructures: readonly OtStructure[];
  readonly standardTerms: readonly string[];

  private constructor() {
    this.wages = reference.wages as WageRow[];
    this.states = reference.states as StateRow[];
    this.equipment = reference.equipment as EquipmentRow[];
    this.equipmentFactors = reference.equipmentFactors as EquipmentFactors;
    this.profitTiers = reference.profitTiers as ProfitTier[];
    this.otStructures = reference.otStructures as OtStructure[];
    this.standardTerms = reference.standardTerms as string[];
  }

  static getInstance(): ReferenceCatalog {
    if (!ReferenceCatalog.instance) {
      ReferenceCatalog.instance = new ReferenceCatalog();
    }
    return ReferenceCatalog.instance;
  }

  findState(name: string): StateRow | undefined {
    return this.states.find((s) => s.name === name || s.abbr === name);
  }

  lookupWage(category: string, wageYr: number): WageRow | undefined {
    return this.wages.find(
      (w) => w.category === category && w.wageYr === wageYr,
    );
  }

  salaryOptions(): number[] {
    const set = new Set(this.wages.map((w) => w.wageYr));
    return Array.from(set).sort((a, b) => a - b);
  }

  emptyEquipmentCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const eq of this.equipment) counts[eq.name] = 0;
    return counts;
  }
}
