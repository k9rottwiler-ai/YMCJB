import type {
  ComputedEquipment,
  ComputedEstimate,
  ComputedFixedTotals,
  ComputedPersonnel,
  ComputedUnitTotals,
  EquipmentSlot,
  EstimateInput,
  ExtraItem,
  OtStructure,
  PersonnelSlot,
  ProfitTier,
  TemplateType,
  UnitLine,
} from "./types";
import { getReference, type EquipmentRow, type StateRow, type WageRow } from "./reference";

export function getProfitTiers(): ProfitTier[] {
  return getReference().profitTiers;
}

export function getOtStructures(): OtStructure[] {
  return getReference().otStructures;
}

export function getStates(): StateRow[] {
  return getReference().states;
}

export function getEquipmentCatalog(): EquipmentRow[] {
  return getReference().equipment;
}

export function getStandardTerms(): string[] {
  return getReference().standardTerms;
}

/** @deprecated Prefer getProfitTiers() for live admin updates */
export const PROFIT_TIERS = getProfitTiers();
/** @deprecated Prefer getOtStructures() for live admin updates */
export const OT_STRUCTURES = getOtStructures();
/** @deprecated Prefer getStates() for live admin updates */
export const STATES = getStates();
/** @deprecated Prefer getEquipmentCatalog() for live admin updates */
export const EQUIPMENT_CATALOG = getEquipmentCatalog();
/** @deprecated Prefer getStandardTerms() for live admin updates */
export const STANDARD_TERMS = getStandardTerms();

export const FIXED_CHANGE_ORDER_TERM =
  "Any change in the project scope will necessitate a formal change order. In the absence of such a change order, any additional resources requested by the client outside the original bid will be billed at (T&E) rates.";

export const EXTRA_ITEM_PRESETS = [
  "Rental Vehicle (Client Prior Approval Required)",
  "Air Fare (Client Prior Approval Required)",
  "Rental Equipment (Client Prior Approval Required)",
  "Support Purchases (Client Prior Approval Required)",
  "Background/Drug Screenings, Memberships (Client Prior Approval Required)",
] as const;

export const HOURS_PER_WEEK = 40;
export const MAX_UNIT_LINES = 10;
export const DEFAULT_PRODUCTIVITY_FACTOR = 0.85;

function asNumber(value: number | "" | null | undefined, fallback = 0): number {
  if (value === "" || value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function riskFactorFromPct(pctValue: number | ""): number {
  const pctNum = Math.max(0, asNumber(pctValue));
  return 1 + pctNum / 100;
}

/** Excel ROUNDUP(value, 0) — away from zero for positive amounts. */
function roundUp(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  return Math.ceil(value);
}

export function emptyPersonnelSlot(): PersonnelSlot {
  return { role: "", name: "", salary: "", estimatedWeeks: "", quantity: 1 };
}

export function emptyEquipmentSlot(): EquipmentSlot {
  return { name: "", count: 1, customHourly: "", estimatedWeeks: "" };
}

export function emptyExtraItem(): ExtraItem {
  return { label: "", notes: "", amount: "" };
}

export function emptyUnitLine(): UnitLine {
  return {
    activity: "",
    unitId: "",
    description: "",
    uom: "",
    productiveMins: "",
    nonProductiveMins: "",
    resourceCount: "",
    equipmentCount: "",
  };
}

export function createEmptyPersonnel(): PersonnelSlot[] {
  return [emptyPersonnelSlot()];
}

export function createEmptyUnitLines(): UnitLine[] {
  return [emptyUnitLine()];
}

export function estimateNumberPrefix(templateType: TemplateType): string {
  if (templateType === "fixed") return "FP";
  if (templateType === "unit") return "UP";
  return "TE";
}

export function createDefaultEstimate(
  templateType: TemplateType = "te",
): EstimateInput {
  const today = new Date().toISOString().slice(0, 10);
  const prefix = estimateNumberPrefix(templateType);

  return {
    id: crypto.randomUUID(),
    templateType,
    estimatorName: "",
    estimatorPhone: "",
    estimatorEmail: "",
    estimateDate: today,
    estimateNumber: `${prefix}-${today.replaceAll("-", "")}-001`,
    customerName: "",
    customerContactName: "",
    projectAddress: "",
    clientPhone: "",
    clientEmail: "",
    projectScope: "",
    mobilizationDate: "",
    startDate: "",
    finishDate: "",
    closeOutDate: "",
    projectState: "Texas",
    baseState: "Texas",
    otStructure:
      templateType === "fixed"
        ? "40ST + 10OT Labor Contingency"
        : templateType === "unit"
          ? "40ST + 5OT Labor Contingency"
          : "OT Billed Separately",
    stProfit: "MED",
    otProfit: "MED",
    estimateRiskPct: templateType === "fixed" ? 10 : "",
    contingencyPct: templateType === "fixed" ? 5 : "",
    productivityFactor:
      templateType === "unit" ? DEFAULT_PRODUCTIVITY_FACTOR : "",
    unitLines: templateType === "unit" ? createEmptyUnitLines() : [],
    personnel: createEmptyPersonnel(),
    equipmentRows: [],
    includeLodging: true,
    includeMeals: true,
    lodgingRooms: templateType === "fixed" ? 1 : "",
    lodgingWeeks: "",
    mealsEmployees: templateType === "fixed" ? 1 : "",
    mealsWeeks: "",
    extraItems: [],
    includeStandByTerm: true,
    includeHolidayTerm: templateType === "te",
    includeChangeOrderTerm: templateType === "fixed",
    additionalTerms: ["", "", "", ""],
  };
}

/** Normalize older saved estimates (equipmentCounts / fixed extra fields). */
export function normalizeEstimate(raw: unknown): EstimateInput {
  const parsed = (raw && typeof raw === "object" ? raw : {}) as Partial<EstimateInput> & {
    equipmentCounts?: Record<string, number>;
    rentalVehicle?: string;
    airFare?: string;
    rentalEquipment?: string;
    supportPurchases?: string;
    backgroundScreenings?: string;
  };

  const templateType: TemplateType =
    parsed.templateType === "fixed"
      ? "fixed"
      : parsed.templateType === "unit"
        ? "unit"
        : "te";
  const base = createDefaultEstimate(templateType);

  let equipmentRows = Array.isArray(parsed.equipmentRows)
    ? parsed.equipmentRows.map((row) => ({
        name: row?.name ?? "",
        count: Math.max(0, Number(row?.count) || 0),
        customHourly:
          row?.customHourly === "" || row?.customHourly == null
            ? ("" as const)
            : Number(row.customHourly),
        estimatedWeeks:
          row?.estimatedWeeks === "" || row?.estimatedWeeks == null
            ? ("" as const)
            : Number(row.estimatedWeeks),
      }))
    : null;

  if (!equipmentRows && parsed.equipmentCounts) {
    equipmentRows = Object.entries(parsed.equipmentCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([name, count]) => ({
        name,
        count: Number(count),
        customHourly: "" as const,
        estimatedWeeks: "" as const,
      }));
  }

  let extraItems = Array.isArray(parsed.extraItems)
    ? parsed.extraItems.map((row) => ({
        label: row?.label ?? "",
        notes: row?.notes ?? "",
        amount:
          row?.amount === "" || row?.amount == null
            ? ("" as const)
            : Number(row.amount),
      }))
    : null;

  if (!extraItems) {
    const legacy: [string, string | undefined][] = [
      [EXTRA_ITEM_PRESETS[0], parsed.rentalVehicle],
      [EXTRA_ITEM_PRESETS[1], parsed.airFare],
      [EXTRA_ITEM_PRESETS[2], parsed.rentalEquipment],
      [EXTRA_ITEM_PRESETS[3], parsed.supportPurchases],
      [EXTRA_ITEM_PRESETS[4], parsed.backgroundScreenings],
    ];
    extraItems = legacy
      .filter(([, notes]) => Boolean(notes && String(notes).trim()))
      .map(([label, notes]) => ({
        label,
        notes: String(notes),
        amount: "" as const,
      }));
  }

  const personnel =
    Array.isArray(parsed.personnel) && parsed.personnel.length > 0
      ? parsed.personnel.map((slot) => ({
          role: slot?.role ?? "",
          name: slot?.name ?? "",
          salary:
            slot?.salary === "" || slot?.salary == null
              ? ("" as const)
              : Number(slot.salary),
          estimatedWeeks:
            slot?.estimatedWeeks === "" || slot?.estimatedWeeks == null
              ? ("" as const)
              : Number(slot.estimatedWeeks),
          quantity:
            slot?.quantity === "" || slot?.quantity == null
              ? (1 as const)
              : Math.max(0, Number(slot.quantity) || 0),
        }))
      : createEmptyPersonnel();

  const unitLines = Array.isArray(parsed.unitLines)
    ? parsed.unitLines.slice(0, MAX_UNIT_LINES).map((row) => ({
        activity: row?.activity ?? "",
        unitId: row?.unitId ?? "",
        description: row?.description ?? "",
        uom: row?.uom ?? "",
        productiveMins:
          row?.productiveMins === "" || row?.productiveMins == null
            ? ("" as const)
            : Number(row.productiveMins),
        nonProductiveMins:
          row?.nonProductiveMins === "" || row?.nonProductiveMins == null
            ? ("" as const)
            : Number(row.nonProductiveMins),
        resourceCount:
          row?.resourceCount === "" || row?.resourceCount == null
            ? ("" as const)
            : Number(row.resourceCount),
        equipmentCount:
          row?.equipmentCount === "" || row?.equipmentCount == null
            ? ("" as const)
            : Number(row.equipmentCount),
      }))
    : base.unitLines;

  return {
    ...base,
    ...parsed,
    templateType,
    customerContactName:
      typeof parsed.customerContactName === "string"
        ? parsed.customerContactName
        : base.customerContactName,
    estimateRiskPct:
      parsed.estimateRiskPct === "" || parsed.estimateRiskPct == null
        ? base.estimateRiskPct
        : Number(parsed.estimateRiskPct),
    contingencyPct:
      parsed.contingencyPct === "" || parsed.contingencyPct == null
        ? base.contingencyPct
        : Number(parsed.contingencyPct),
    productivityFactor:
      parsed.productivityFactor === "" || parsed.productivityFactor == null
        ? base.productivityFactor
        : Number(parsed.productivityFactor),
    lodgingRooms:
      parsed.lodgingRooms === "" || parsed.lodgingRooms == null
        ? base.lodgingRooms
        : Number(parsed.lodgingRooms),
    lodgingWeeks:
      parsed.lodgingWeeks === "" || parsed.lodgingWeeks == null
        ? base.lodgingWeeks
        : Number(parsed.lodgingWeeks),
    mealsEmployees:
      parsed.mealsEmployees === "" || parsed.mealsEmployees == null
        ? base.mealsEmployees
        : Number(parsed.mealsEmployees),
    mealsWeeks:
      parsed.mealsWeeks === "" || parsed.mealsWeeks == null
        ? base.mealsWeeks
        : Number(parsed.mealsWeeks),
    includeChangeOrderTerm:
      parsed.includeChangeOrderTerm ?? base.includeChangeOrderTerm,
    personnel,
    unitLines,
    equipmentRows: equipmentRows ?? [],
    extraItems: extraItems ?? [],
    additionalTerms: Array.isArray(parsed.additionalTerms)
      ? parsed.additionalTerms
      : base.additionalTerms,
  };
}

function findState(name: string): StateRow | undefined {
  return getReference().states.find((s) => s.name === name || s.abbr === name);
}

function ceiling(value: number, significance: number): number {
  if (significance <= 0) return Math.ceil(value);
  return Math.ceil(value / significance) * significance;
}

function lookupWage(category: string, wageYr: number): WageRow | undefined {
  return getReference().wages.find(
    (w) => w.category === category && w.wageYr === wageYr,
  );
}

function catalogRate(name: string): EquipmentRow | undefined {
  return getReference().equipment.find((eq) => eq.name === name);
}

/** Fixed Price NTE bill rate prefers blended contingency rates (Excel FP template). */
function fixedBillRate(
  input: EstimateInput,
  st5ot: number,
  st10ot: number,
  stPrice: number,
): number {
  if (input.otStructure === "40ST + 5OT Labor Contingency") return st5ot;
  if (input.otStructure === "40ST + 10OT Labor Contingency") return st10ot;
  // OT billed separately: Excel FP sheet uses the 10OT blended column for NTE.
  return st10ot || stPrice;
}

function computePersonnel(
  input: EstimateInput,
  colDelta: number,
  riskFactor: number,
): ComputedPersonnel[] {
  const isFixed = input.templateType === "fixed";

  return input.personnel
    .map((slot) => {
      const salary = asNumber(slot.salary);
      if (!slot.role && !slot.name && !salary) return null;

      const adjustedSalary = salary
        ? ceiling(salary + salary * colDelta, 5000)
        : 0;
      const stRow = lookupWage(input.stProfit, adjustedSalary);
      const otRow = lookupWage(input.otProfit, adjustedSalary);
      const stPrice = stRow?.stPrice ?? 0;
      const otPrice = otRow?.otPrice ?? 0;
      const st5ot = stRow?.st5ot ?? 0;
      const st10ot = otRow?.st10ot ?? 0;

      let billedSt = stPrice;
      let billedOt = 0;
      if (input.otStructure === "OT Billed Separately") {
        billedSt = stPrice;
        billedOt = otPrice;
      } else if (input.otStructure === "40ST + 5OT Labor Contingency") {
        billedSt = st5ot;
        billedOt = 0;
      } else {
        billedSt = st10ot;
        billedOt = 0;
      }

      const estimatedWeeks = Math.max(0, asNumber(slot.estimatedWeeks));
      const quantity = Math.max(0, asNumber(slot.quantity, 1));
      const baseHours = estimatedWeeks * HOURS_PER_WEEK;
      const adjustedHours = isFixed ? baseHours * riskFactor : baseHours;
      const nteRate = isFixed
        ? fixedBillRate(input, st5ot, st10ot, stPrice)
        : billedSt;
      const estimateAmount = isFixed ? nteRate * adjustedHours : 0;

      return {
        item: "",
        name: slot.name,
        role: slot.role,
        salary,
        colAdjustment: colDelta,
        adjustedSalary,
        stPrice,
        otPrice,
        st5ot,
        st10ot,
        billedSt,
        billedOt,
        nteRate,
        estimatedWeeks,
        quantity,
        baseHours,
        adjustedHours,
        estimateAmount,
      } satisfies ComputedPersonnel;
    })
    .filter((row): row is ComputedPersonnel => row !== null)
    .map((row, index) => ({ ...row, item: `M${index + 1}` }));
}

function computeEquipment(
  input: EstimateInput,
  colDelta: number,
  riskFactor: number,
): ComputedEquipment[] {
  const isFixed = input.templateType === "fixed";

  return input.equipmentRows
    .map((slot) => {
      const count = Number(slot.count) || 0;
      const name = slot.name.trim();
      if (!count || !name) return null;

      const catalog = catalogRate(name);
      const customHourly =
        slot.customHourly === "" ? null : Number(slot.customHourly);
      const baseHourly =
        customHourly != null && Number.isFinite(customHourly) && customHourly > 0
          ? customHourly
          : (catalog?.hourlyRate ?? 0);
      if (!baseHourly) return null;

      const adjustedHourly = baseHourly + baseHourly * colDelta;
      const factors = getReference().equipmentFactors;
      const daily = adjustedHourly * factors.dailyHours;
      const weekly = adjustedHourly * factors.weeklyHours;
      const monthly = adjustedHourly * factors.monthlyHours;
      const estimatedWeeks = Math.max(0, asNumber(slot.estimatedWeeks));
      const adjustedWeeks = isFixed ? estimatedWeeks * riskFactor : estimatedWeeks;
      // Qty × weekly × risk-adjusted weeks (Excel gates on qty but omits the multiply).
      const estimateAmount = isFixed ? weekly * count * adjustedWeeks : 0;

      return {
        item: "",
        className: catalog?.class ?? "Custom",
        name,
        count,
        baseHourly,
        adjustedHourly,
        daily,
        weekly,
        monthly,
        estimatedWeeks,
        adjustedWeeks,
        estimateAmount,
      } satisfies ComputedEquipment;
    })
    .filter((row): row is ComputedEquipment => row !== null)
    .map((row, index) => ({ ...row, item: `E${index + 1}` }));
}

function computeUnitTotals(
  input: EstimateInput,
  personnel: ComputedPersonnel[],
  equipment: ComputedEquipment[],
): ComputedUnitTotals {
  const productivityFactor = Math.min(
    1,
    Math.max(0, asNumber(input.productivityFactor, DEFAULT_PRODUCTIVITY_FACTOR)),
  );

  // Excel: Y93 = SUMIF(Y85:Y91,">1",...); Y94 = SUM(qty); Y95 = Y93/Y94; Y97 = Y95/60
  let extendedLabor = 0;
  let crewQuantity = 0;
  for (const row of personnel) {
    const qty = Math.max(0, row.quantity);
    crewQuantity += qty;
    const extended = row.st5ot * qty;
    if (extended > 1) extendedLabor += extended;
  }
  const laborPerHour = crewQuantity > 0 ? extendedLabor / crewQuantity : 0;
  const laborPerMin = laborPerHour / 60;

  // Excel: T74 = SUMIF(extended,">1"); T76 = SUM(qty); T77 = (T74/60)/T76
  let extendedEquip = 0;
  let equipmentQuantity = 0;
  for (const row of equipment) {
    const qty = Math.max(0, row.count);
    equipmentQuantity += qty;
    const extended = row.adjustedHourly * qty;
    if (extended > 1) extendedEquip += extended;
  }
  const equipmentPerMin =
    equipmentQuantity > 0 ? extendedEquip / 60 / equipmentQuantity : 0;

  const units = input.unitLines
    .map((line, index) => {
      const activity = line.activity.trim();
      const unitId = line.unitId.trim();
      const description = line.description.trim();
      const uom = line.uom.trim();
      const productiveMins = Math.max(0, asNumber(line.productiveMins));
      const nonProductiveMins = Math.max(0, asNumber(line.nonProductiveMins));
      const resourceCount = Math.max(0, asNumber(line.resourceCount));
      const equipmentCount = Math.max(0, asNumber(line.equipmentCount));

      const hasContent =
        activity ||
        unitId ||
        description ||
        uom ||
        productiveMins > 0 ||
        nonProductiveMins > 0 ||
        resourceCount > 0 ||
        equipmentCount > 0;
      if (!hasContent) return null;

      // S = (P+Q) + ((1-R)*(P+Q)) = (P+Q)*(2-R)
      const totalTimeMins =
        (productiveMins + nonProductiveMins) * (2 - productivityFactor);
      const blendedLaborRate = laborPerMin * resourceCount;
      // W = ROUNDUP(S * (T * V)) with V = laborPerMin * T → S * T² * laborPerMin
      const manpowerPrice = roundUp(
        totalTimeMins * (resourceCount * blendedLaborRate),
      );
      const equipmentPrice = roundUp(
        equipmentCount * equipmentPerMin * totalTimeMins,
      );
      const unitPrice = manpowerPrice + equipmentPrice;

      return {
        item: `U${index + 1}`,
        activity,
        unitId: unitId || `U${index + 1}`,
        description,
        uom,
        productiveMins,
        nonProductiveMins,
        productivityFactor,
        totalTimeMins,
        resourceCount,
        equipmentCount,
        blendedLaborRate,
        manpowerPrice,
        equipmentPrice,
        unitPrice,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return {
    productivityFactor,
    laborPerMin,
    equipmentPerMin,
    crewQuantity,
    equipmentQuantity,
    units,
  };
}

export function computeEstimate(input: EstimateInput): ComputedEstimate {
  const base = findState(input.baseState);
  const project = findState(input.projectState);
  const baseCol = base?.colIndex ?? 100;
  const projectCol = project?.colIndex ?? 100;
  const colDelta = (projectCol - baseCol) / 100;
  const isFixed = input.templateType === "fixed";
  const isUnit = input.templateType === "unit";
  const riskFactor = isFixed ? riskFactorFromPct(input.estimateRiskPct) : 1;

  const lodgingDaily = project?.lodging ?? 113;
  const mealsDaily = project?.meals ?? 68;

  const lodgingRooms = Math.max(0, asNumber(input.lodgingRooms));
  const lodgingWeeks = Math.max(0, asNumber(input.lodgingWeeks));
  const lodgingAdjustedWeeks = isFixed
    ? lodgingWeeks * riskFactor
    : lodgingWeeks;
  const mealsEmployees = Math.max(0, asNumber(input.mealsEmployees));
  const mealsWeeks = Math.max(0, asNumber(input.mealsWeeks));
  const mealsAdjustedWeeks = isFixed ? mealsWeeks * riskFactor : mealsWeeks;

  const lodgingWeeklyUnit = lodgingDaily * 7;
  const mealsWeeklyUnit = mealsDaily * 7;

  const lodgingAmount =
    isFixed && input.includeLodging
      ? lodgingRooms * lodgingWeeklyUnit * lodgingAdjustedWeeks
      : 0;
  const mealsAmount =
    isFixed && input.includeMeals
      ? mealsEmployees * mealsWeeklyUnit * mealsAdjustedWeeks
      : 0;

  const personnel = computePersonnel(input, colDelta, riskFactor);
  const equipment = computeEquipment(input, colDelta, riskFactor);
  const unitTotals = isUnit
    ? computeUnitTotals(input, personnel, equipment)
    : {
        productivityFactor: 0,
        laborPerMin: 0,
        equipmentPerMin: 0,
        crewQuantity: 0,
        equipmentQuantity: 0,
        units: [],
      };

  const extras = input.extraItems
    .filter((row) => row.label.trim() || row.notes.trim() || asNumber(row.amount))
    .map((row) => ({
      label: row.label.trim() || "Additional item",
      notes: row.notes.trim(),
      amount: Math.max(0, asNumber(row.amount)),
    }));

  const personnelTotal = personnel.reduce((sum, row) => sum + row.estimateAmount, 0);
  const equipmentTotal = equipment.reduce((sum, row) => sum + row.estimateAmount, 0);
  const lodgingMealsTotal = lodgingAmount + mealsAmount;
  const extrasTotal = isFixed
    ? extras.reduce((sum, row) => sum + row.amount, 0)
    : 0;
  const subtotal =
    personnelTotal + equipmentTotal + lodgingMealsTotal + extrasTotal;
  const contingencyPct = isFixed
    ? Math.max(0, asNumber(input.contingencyPct)) / 100
    : 0;
  const contingencyAmount = subtotal * contingencyPct;
  const grandTotal = subtotal + contingencyAmount;

  const fixedTotals: ComputedFixedTotals = {
    personnelTotal,
    equipmentTotal,
    lodgingMealsTotal,
    extrasTotal,
    subtotal,
    contingencyAmount,
    grandTotal,
    riskFactor,
    contingencyPct,
  };

  const termsCatalog = getStandardTerms();
  const terms: string[] = [];
  if (input.includeStandByTerm) terms.push(termsCatalog[0]);
  if (!isFixed && input.includeHolidayTerm) terms.push(termsCatalog[1]);
  if (isFixed && input.includeChangeOrderTerm) {
    terms.push(FIXED_CHANGE_ORDER_TERM);
  }
  for (const t of input.additionalTerms) {
    if (t.trim()) terms.push(t.trim());
  }

  return {
    colDelta,
    baseCol,
    projectCol,
    personnel,
    equipment,
    perDiem: {
      lodgingDaily: input.includeLodging ? lodgingDaily : 0,
      lodgingWeekly: input.includeLodging ? lodgingWeeklyUnit : 0,
      lodgingMonthly: input.includeLodging ? lodgingDaily * 24 : 0,
      mealsDaily: input.includeMeals ? mealsDaily : 0,
      mealsWeekly: input.includeMeals ? mealsWeeklyUnit : 0,
      mealsMonthly: input.includeMeals ? mealsDaily * 24 : 0,
      lodgingRooms,
      lodgingWeeks,
      lodgingAdjustedWeeks,
      lodgingAmount,
      mealsEmployees,
      mealsWeeks,
      mealsAdjustedWeeks,
      mealsAmount,
    },
    extras,
    fixedTotals,
    unitTotals,
    terms,
  };
}

export function money(value: number, digits = 0): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function salaryOptions(): number[] {
  const set = new Set(getReference().wages.map((w) => w.wageYr));
  return Array.from(set).sort((a, b) => a - b);
}

export function switchTemplateType(
  current: EstimateInput,
  templateType: TemplateType,
): EstimateInput {
  if (current.templateType === templateType) return current;
  const prefix = estimateNumberPrefix(templateType);
  const today = current.estimateDate || new Date().toISOString().slice(0, 10);
  const numberLooksAuto =
    !current.estimateNumber ||
    /^(TE|FP|UP)-\d{8}-\d+$/.test(current.estimateNumber);

  return {
    ...current,
    templateType,
    estimateNumber: numberLooksAuto
      ? `${prefix}-${today.replaceAll("-", "")}-001`
      : current.estimateNumber,
    otStructure:
      templateType === "unit"
        ? "40ST + 5OT Labor Contingency"
        : current.otStructure,
    // Keep OT structure and holiday-term preference intact across switches so
    // previewing Fixed Price does not rewrite the T&E rate sheet settings.
    estimateRiskPct:
      current.estimateRiskPct === "" || current.estimateRiskPct == null
        ? templateType === "fixed"
          ? 10
          : ""
        : current.estimateRiskPct,
    contingencyPct:
      current.contingencyPct === "" || current.contingencyPct == null
        ? templateType === "fixed"
          ? 5
          : ""
        : current.contingencyPct,
    productivityFactor:
      current.productivityFactor === "" || current.productivityFactor == null
        ? templateType === "unit"
          ? DEFAULT_PRODUCTIVITY_FACTOR
          : ""
        : current.productivityFactor,
    unitLines:
      current.unitLines.length > 0
        ? current.unitLines
        : templateType === "unit"
          ? createEmptyUnitLines()
          : current.unitLines,
    lodgingRooms:
      current.lodgingRooms === "" || current.lodgingRooms == null
        ? templateType === "fixed"
          ? 1
          : ""
        : current.lodgingRooms,
    mealsEmployees:
      current.mealsEmployees === "" || current.mealsEmployees == null
        ? templateType === "fixed"
          ? Math.max(1, current.personnel.filter((p) => p.role || p.name).length)
          : ""
        : current.mealsEmployees,
    includeHolidayTerm:
      templateType === "te" ? true : current.includeHolidayTerm,
    includeChangeOrderTerm:
      templateType === "fixed" ? true : current.includeChangeOrderTerm,
  };
}
