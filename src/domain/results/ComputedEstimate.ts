import type { PersonnelLine } from "../lineItems/PersonnelLine";
import type { EquipmentLine } from "../lineItems/EquipmentLine";
import type { PerDiemRates } from "./PerDiemRates";
import type { PersonnelLineSnapshot } from "../lineItems/PersonnelLine";
import type { EquipmentLineSnapshot } from "../lineItems/EquipmentLine";

export type ComputedEstimateSnapshot = {
  colDelta: number;
  baseCol: number;
  projectCol: number;
  personnel: PersonnelLineSnapshot[];
  equipment: EquipmentLineSnapshot[];
  perDiem: ReturnType<PerDiemRates["toSnapshot"]>;
  terms: string[];
};

/**
 * Aggregate result object produced by Estimate.compute().
 * Holds line-item objects and exposes a plain snapshot for React views.
 */
export class ComputedEstimate {
  readonly colDelta: number;
  readonly baseCol: number;
  readonly projectCol: number;
  readonly personnelLines: PersonnelLine[];
  readonly equipmentLines: EquipmentLine[];
  readonly perDiem: PerDiemRates;
  readonly terms: string[];

  constructor(args: {
    colDelta: number;
    baseCol: number;
    projectCol: number;
    personnelLines: PersonnelLine[];
    equipmentLines: EquipmentLine[];
    perDiem: PerDiemRates;
    terms: string[];
  }) {
    this.colDelta = args.colDelta;
    this.baseCol = args.baseCol;
    this.projectCol = args.projectCol;
    this.personnelLines = args.personnelLines;
    this.equipmentLines = args.equipmentLines;
    this.perDiem = args.perDiem;
    this.terms = args.terms;
  }

  /** Plain data for UI components (keeps views free of domain class APIs). */
  toSnapshot(): ComputedEstimateSnapshot {
    return {
      colDelta: this.colDelta,
      baseCol: this.baseCol,
      projectCol: this.projectCol,
      personnel: this.personnelLines.map((line) => line.toSnapshot()),
      equipment: this.equipmentLines.map((line) => line.toSnapshot()),
      perDiem: this.perDiem.toSnapshot(),
      terms: [...this.terms],
    };
  }
}
