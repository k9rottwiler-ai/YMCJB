export type TemplateType = "te" | "fixed" | "unit";

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
  /** Fixed Price: estimated weeks on the job (hours = weeks × 40). */
  estimatedWeeks: number | "";
  /** Unit Pricing: headcount for this role in the blended crew rate. */
  quantity: number | "";
}

export interface UnitLine {
  activity: string;
  unitId: string;
  description: string;
  uom: string;
  productiveMins: number | "";
  nonProductiveMins: number | "";
  resourceCount: number | "";
  equipmentCount: number | "";
}

export interface EquipmentSlot {
  /** Catalog equipment name, or a custom label when `customHourly` is set. */
  name: string;
  count: number;
  /** When set, treats the row as custom equipment (not from the catalog). */
  customHourly: number | "";
  /** Fixed Price: estimated weeks on the job. */
  estimatedWeeks: number | "";
}

export interface ExtraItem {
  label: string;
  notes: string;
  /** Fixed Price: optional dollar amount rolled into the NTE total. */
  amount: number | "";
}

export interface EstimateInput {
  id: string;
  templateType: TemplateType;
  estimatorName: string;
  estimatorPhone: string;
  estimatorEmail: string;
  estimateDate: string;
  estimateNumber: string;
  customerName: string;
  /** Customer point of contact name. */
  customerContactName: string;
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
  /** Fixed Price: risk fraction as percent (e.g. 10 = 10%). */
  estimateRiskPct: number | "";
  /** Fixed Price: completion bonus / contingency as percent of subtotal. */
  contingencyPct: number | "";
  /**
   * Unit Pricing: productivity factor as a decimal (e.g. 0.85 = 85%).
   * Total time mins = (prod + nonProd) × (2 − factor).
   */
  productivityFactor: number | "";
  /** Unit Pricing: up to 10 priced unit activities. */
  unitLines: UnitLine[];
  personnel: PersonnelSlot[];
  equipmentRows: EquipmentSlot[];
  includeLodging: boolean;
  includeMeals: boolean;
  lodgingRooms: number | "";
  lodgingWeeks: number | "";
  mealsEmployees: number | "";
  mealsWeeks: number | "";
  extraItems: ExtraItem[];
  includeStandByTerm: boolean;
  includeHolidayTerm: boolean;
  /** Fixed Price: change-order / out-of-scope billed at T&E rates. */
  includeChangeOrderTerm: boolean;
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
  /** Rate used for Fixed Price NTE amount (blended when applicable). */
  nteRate: number;
  estimatedWeeks: number;
  /** Unit Pricing: headcount contributing to the blended crew rate. */
  quantity: number;
  baseHours: number;
  adjustedHours: number;
  estimateAmount: number;
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
  estimatedWeeks: number;
  adjustedWeeks: number;
  estimateAmount: number;
}

export interface ComputedPerDiem {
  lodgingDaily: number;
  lodgingWeekly: number;
  lodgingMonthly: number;
  mealsDaily: number;
  mealsWeekly: number;
  mealsMonthly: number;
  lodgingRooms: number;
  lodgingWeeks: number;
  lodgingAdjustedWeeks: number;
  lodgingAmount: number;
  mealsEmployees: number;
  mealsWeeks: number;
  mealsAdjustedWeeks: number;
  mealsAmount: number;
}

export interface ComputedFixedTotals {
  personnelTotal: number;
  equipmentTotal: number;
  lodgingMealsTotal: number;
  extrasTotal: number;
  subtotal: number;
  contingencyAmount: number;
  grandTotal: number;
  riskFactor: number;
  contingencyPct: number;
}

export interface ComputedUnitLine {
  item: string;
  activity: string;
  unitId: string;
  description: string;
  uom: string;
  productiveMins: number;
  nonProductiveMins: number;
  productivityFactor: number;
  totalTimeMins: number;
  resourceCount: number;
  equipmentCount: number;
  blendedLaborRate: number;
  manpowerPrice: number;
  equipmentPrice: number;
  unitPrice: number;
}

export interface ComputedUnitTotals {
  productivityFactor: number;
  laborPerMin: number;
  equipmentPerMin: number;
  crewQuantity: number;
  equipmentQuantity: number;
  units: ComputedUnitLine[];
}

export interface ComputedEstimate {
  colDelta: number;
  baseCol: number;
  projectCol: number;
  personnel: ComputedPersonnel[];
  equipment: ComputedEquipment[];
  perDiem: ComputedPerDiem;
  extras: { label: string; notes: string; amount: number }[];
  fixedTotals: ComputedFixedTotals;
  unitTotals: ComputedUnitTotals;
  terms: string[];
}
