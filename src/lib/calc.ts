import reference from "../data/reference.json";
import type {
  ComputedEquipment,
  ComputedEstimate,
  ComputedPersonnel,
  EquipmentSlot,
  EstimateInput,
  ExtraItem,
  OtStructure,
  PersonnelSlot,
  ProfitTier,
} from "./types";

type WageRow = {
  wageYr: number;
  wageHr: number;
  category: string;
  stPrice: number;
  otPrice: number;
  st5ot: number;
  st10ot: number;
};

type StateRow = {
  name: string;
  abbr: string;
  lodging: number;
  meals: number;
  colIndex: number;
};

type EquipmentRow = {
  class: string;
  name: string;
  hourlyRate: number;
};

const wages = reference.wages as WageRow[];
const states = reference.states as StateRow[];
const equipmentCatalog = reference.equipment as EquipmentRow[];
const factors = reference.equipmentFactors as {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
};

export const PROFIT_TIERS = reference.profitTiers as ProfitTier[];
export const OT_STRUCTURES = reference.otStructures as OtStructure[];
export const STATES = states;
export const EQUIPMENT_CATALOG = equipmentCatalog;
export const STANDARD_TERMS = reference.standardTerms as string[];

export const EXTRA_ITEM_PRESETS = [
  "Rental Vehicle (Client Prior Approval Required)",
  "Air Fare (Client Prior Approval Required)",
  "Rental Equipment (Client Prior Approval Required)",
  "Support Purchases (Client Prior Approval Required)",
  "Background/Drug Screenings, Memberships (Client Prior Approval Required)",
] as const;

export function emptyPersonnelSlot(): PersonnelSlot {
  return { role: "", name: "", salary: "" };
}

export function emptyEquipmentSlot(): EquipmentSlot {
  return { name: "", count: 1, customHourly: "" };
}

export function emptyExtraItem(): ExtraItem {
  return { label: "", notes: "" };
}

export function createEmptyPersonnel(): PersonnelSlot[] {
  return [emptyPersonnelSlot()];
}

export function createDefaultEstimate(): EstimateInput {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: crypto.randomUUID(),
    estimatorName: "",
    estimatorPhone: "",
    estimatorEmail: "",
    estimateDate: today,
    estimateNumber: `TE-${today.replaceAll("-", "")}-001`,
    customerName: "",
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
    otStructure: "OT Billed Separately",
    stProfit: "MED",
    otProfit: "MED",
    personnel: createEmptyPersonnel(),
    equipmentRows: [],
    includeLodging: true,
    includeMeals: true,
    extraItems: [],
    includeStandByTerm: true,
    includeHolidayTerm: true,
    additionalTerms: ["", "", "", ""],
  };
}

/** Normalize older saved estimates (equipmentCounts / fixed extra fields). */
export function normalizeEstimate(raw: unknown): EstimateInput {
  const base = createDefaultEstimate();
  if (!raw || typeof raw !== "object") return base;

  const parsed = raw as Partial<EstimateInput> & {
    equipmentCounts?: Record<string, number>;
    rentalVehicle?: string;
    airFare?: string;
    rentalEquipment?: string;
    supportPurchases?: string;
    backgroundScreenings?: string;
  };

  let equipmentRows = Array.isArray(parsed.equipmentRows)
    ? parsed.equipmentRows.map((row) => ({
        name: row?.name ?? "",
        count: Math.max(0, Number(row?.count) || 0),
        customHourly:
          row?.customHourly === "" || row?.customHourly == null
            ? ("" as const)
            : Number(row.customHourly),
      }))
    : null;

  if (!equipmentRows && parsed.equipmentCounts) {
    equipmentRows = Object.entries(parsed.equipmentCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([name, count]) => ({
        name,
        count: Number(count),
        customHourly: "" as const,
      }));
  }

  let extraItems = Array.isArray(parsed.extraItems)
    ? parsed.extraItems.map((row) => ({
        label: row?.label ?? "",
        notes: row?.notes ?? "",
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
      .map(([label, notes]) => ({ label, notes: String(notes) }));
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
        }))
      : createEmptyPersonnel();

  return {
    ...base,
    ...parsed,
    personnel,
    equipmentRows: equipmentRows ?? [],
    extraItems: extraItems ?? [],
    additionalTerms: Array.isArray(parsed.additionalTerms)
      ? parsed.additionalTerms
      : base.additionalTerms,
  };
}

function findState(name: string): StateRow | undefined {
  return states.find((s) => s.name === name || s.abbr === name);
}

function ceiling(value: number, significance: number): number {
  if (significance <= 0) return Math.ceil(value);
  return Math.ceil(value / significance) * significance;
}

function lookupWage(category: string, wageYr: number): WageRow | undefined {
  return wages.find((w) => w.category === category && w.wageYr === wageYr);
}

function catalogRate(name: string): EquipmentRow | undefined {
  return equipmentCatalog.find((eq) => eq.name === name);
}

function computePersonnel(
  input: EstimateInput,
  colDelta: number,
): ComputedPersonnel[] {
  return input.personnel
    .map((slot) => {
      const salary =
        typeof slot.salary === "number"
          ? slot.salary
          : Number(slot.salary) || 0;
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
      } satisfies ComputedPersonnel;
    })
    .filter((row): row is ComputedPersonnel => row !== null)
    .map((row, index) => ({ ...row, item: `M${index + 1}` }));
}

function computeEquipment(
  input: EstimateInput,
  colDelta: number,
): ComputedEquipment[] {
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
      return {
        item: "",
        className: catalog?.class ?? "Custom",
        name,
        count,
        baseHourly,
        adjustedHourly,
        daily: adjustedHourly * factors.dailyHours,
        weekly: adjustedHourly * factors.weeklyHours,
        monthly: adjustedHourly * factors.monthlyHours,
      } satisfies ComputedEquipment;
    })
    .filter((row): row is ComputedEquipment => row !== null)
    .map((row, index) => ({ ...row, item: `E${index + 1}` }));
}

export function computeEstimate(input: EstimateInput): ComputedEstimate {
  const base = findState(input.baseState);
  const project = findState(input.projectState);
  const baseCol = base?.colIndex ?? 100;
  const projectCol = project?.colIndex ?? 100;
  const colDelta = (projectCol - baseCol) / 100;

  const lodgingDaily = project?.lodging ?? 113;
  const mealsDaily = project?.meals ?? 68;

  const terms: string[] = [];
  if (input.includeStandByTerm) terms.push(STANDARD_TERMS[0]);
  if (input.includeHolidayTerm) terms.push(STANDARD_TERMS[1]);
  for (const t of input.additionalTerms) {
    if (t.trim()) terms.push(t.trim());
  }

  return {
    colDelta,
    baseCol,
    projectCol,
    personnel: computePersonnel(input, colDelta),
    equipment: computeEquipment(input, colDelta),
    perDiem: {
      lodgingDaily: input.includeLodging ? lodgingDaily : 0,
      lodgingWeekly: input.includeLodging ? lodgingDaily * 7 : 0,
      lodgingMonthly: input.includeLodging ? lodgingDaily * 24 : 0,
      mealsDaily: input.includeMeals ? mealsDaily : 0,
      mealsWeekly: input.includeMeals ? mealsDaily * 7 : 0,
      mealsMonthly: input.includeMeals ? mealsDaily * 24 : 0,
    },
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
  const set = new Set(wages.map((w) => w.wageYr));
  return Array.from(set).sort((a, b) => a - b);
}
