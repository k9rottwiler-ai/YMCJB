import { PersonnelSlot } from "./PersonnelSlot";
import type { PersonnelSlotData } from "./PersonnelSlot";
import type { ProfitTier } from "../valueObjects/ProfitTier";
import type { OtStructure } from "../valueObjects/OtStructure";
import { ColAdjustment } from "../valueObjects/ColAdjustment";
import { otBillingStrategyFor } from "../strategies/OtBillingStrategy";
import { PersonnelLine } from "../lineItems/PersonnelLine";
import { EquipmentLine } from "../lineItems/EquipmentLine";
import { PerDiemRates } from "../results/PerDiemRates";
import { ComputedEstimate } from "../results/ComputedEstimate";
import { ReferenceCatalog } from "../../catalogs/ReferenceCatalog";

/**
 * Plain DTO for React state and JSON persistence.
 * The Estimate entity wraps this data and owns compute behavior.
 */
export type EstimateInput = {
  id: string;
  estimatorName: string;
  estimatorPhone: string;
  estimatorEmail: string;
  estimateDate: string;
  estimateNumber: string;
  customerName: string;
  projectAddress: string;
  clientPhone: string;
  clientEmail: string;
  projectScope: string;
  mobilizationDate: string;
  startDate: string;
  finishDate: string;
  closeOutDate: string;
  projectState: string;
  baseState: string;
  otStructure: OtStructure;
  stProfit: ProfitTier;
  otProfit: ProfitTier;
  personnel: PersonnelSlotData[];
  equipmentCounts: Record<string, number>;
  includeLodging: boolean;
  includeMeals: boolean;
  rentalVehicle: string;
  airFare: string;
  rentalEquipment: string;
  supportPurchases: string;
  backgroundScreenings: string;
  includeStandByTerm: boolean;
  includeHolidayTerm: boolean;
  additionalTerms: string[];
};

/**
 * Entity: a T&E estimate.
 * Encapsulates input data and the compute() orchestration that produces
 * priced line items via strategies and catalog lookups.
 */
export class Estimate {
  private data: EstimateInput;

  constructor(data: EstimateInput) {
    this.data = structuredClone(data);
  }

  get input(): EstimateInput {
    return structuredClone(this.data);
  }

  static fromInput(data: EstimateInput): Estimate {
    return new Estimate(data);
  }

  /**
   * Polymorphism in action: OT structure selects a billing strategy;
   * personnel/equipment subclasses of LineItem build their own snapshots.
   */
  compute(catalog: ReferenceCatalog = ReferenceCatalog.getInstance()): ComputedEstimate {
    const base = catalog.findState(this.data.baseState);
    const project = catalog.findState(this.data.projectState);
    const col = new ColAdjustment(
      base?.colIndex ?? 100,
      project?.colIndex ?? 100,
    );
    const billing = otBillingStrategyFor(this.data.otStructure);

    const personnelLines = this.data.personnel
      .map((raw, index) =>
        PersonnelLine.fromSlot(
          PersonnelSlot.fromJSON(raw),
          index,
          col,
          this.data.stProfit,
          this.data.otProfit,
          billing,
          catalog,
        ),
      )
      .filter((line): line is PersonnelLine => line !== null);

    const equipmentLines = catalog.equipment
      .map((eq, index) =>
        EquipmentLine.fromCatalogRow(
          eq,
          index,
          Number(this.data.equipmentCounts[eq.name] ?? 0),
          col,
          catalog,
        ),
      )
      .filter((line): line is EquipmentLine => line !== null);

    const lodgingDaily = project?.lodging ?? 110;
    const mealsDaily = project?.meals ?? 68;
    const perDiem = new PerDiemRates({
      lodgingDaily,
      mealsDaily,
      includeLodging: this.data.includeLodging,
      includeMeals: this.data.includeMeals,
    });

    const terms: string[] = [];
    if (this.data.includeStandByTerm) terms.push(catalog.standardTerms[0]);
    if (this.data.includeHolidayTerm) terms.push(catalog.standardTerms[1]);
    for (const t of this.data.additionalTerms) {
      if (t.trim()) terms.push(t.trim());
    }

    return new ComputedEstimate({
      colDelta: col.delta,
      baseCol: col.baseCol,
      projectCol: col.projectCol,
      personnelLines,
      equipmentLines,
      perDiem,
      terms,
    });
  }
}
