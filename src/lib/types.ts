export type ProfitTier =
  | "MINIMUM"
  | "LOW"
  | "MILD"
  | "MED"
  | "HIGH"
  | "EXHIGH";

export type OtStructure =
  | "OT Billed Separately"
  | "40ST + 5OT Labor Contingency"
  | "40ST + 10OT Labor Contingency";

export interface PersonnelSlot {
  role: string;
  name: string;
  salary: number | "";
}

export interface EquipmentSlot {
  /** Catalog equipment name, or a custom label when `customHourly` is set. */
  name: string;
  count: number;
  /** When set, treats the row as custom equipment (not from the catalog). */
  customHourly: number | "";
}

export interface ExtraItem {
  label: string;
  notes: string;
}

export interface EstimateInput {
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
  personnel: PersonnelSlot[];
  equipmentRows: EquipmentSlot[];
  includeLodging: boolean;
  includeMeals: boolean;
  extraItems: ExtraItem[];
  includeStandByTerm: boolean;
  includeHolidayTerm: boolean;
  additionalTerms: string[];
}

export interface ComputedPersonnel {
  item: string;
  name: string;
  role: string;
  salary: number;
  colAdjustment: number;
  adjustedSalary: number;
  stPrice: number;
  otPrice: number;
  st5ot: number;
  st10ot: number;
  billedSt: number;
  billedOt: number;
}

export interface ComputedEquipment {
  item: string;
  className: string;
  name: string;
  count: number;
  baseHourly: number;
  adjustedHourly: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface ComputedPerDiem {
  lodgingDaily: number;
  lodgingWeekly: number;
  lodgingMonthly: number;
  mealsDaily: number;
  mealsWeekly: number;
  mealsMonthly: number;
}

export interface ComputedEstimate {
  colDelta: number;
  baseCol: number;
  projectCol: number;
  personnel: ComputedPersonnel[];
  equipment: ComputedEquipment[];
  perDiem: ComputedPerDiem;
  terms: string[];
}
