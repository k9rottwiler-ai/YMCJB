import reference from "../data/reference.json";
import type {
  ComputedEquipment,
  ComputedEstimate,
  ComputedPersonnel,
  EstimateInput,
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

export function createEmptyPersonnel(): PersonnelSlot[] {
  return Array.from({ length: 7 }, () => ({
    role: "",
    name: "",
    salary: "",
  }));
}

export function createDefaultEstimate(): EstimateInput {
  const today = new Date().toISOString().slice(0, 10);
  const counts: Record<string, number> = {};
  for (const eq of equipmentCatalog) counts[eq.name] = 0;

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
    equipmentCounts: counts,
    includeLodging: true,
    includeMeals: true,
    rentalVehicle: "",
    airFare: "",
    rentalEquipment: "",
    supportPurchases: "",
    backgroundScreenings: "",
    includeStandByTerm: true,
    includeHolidayTerm: true,
    additionalTerms: ["", "", "", ""],
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

function computePersonnel(
  input: EstimateInput,
  colDelta: number,
): ComputedPersonnel[] {
  return input.personnel
    .map((slot, index) => {
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
        item: `M${index + 1}`,
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
    .filter((row): row is ComputedPersonnel => row !== null);
}

function computeEquipment(
  input: EstimateInput,
  colDelta: number,
): ComputedEquipment[] {
  return equipmentCatalog
    .map((eq, index) => {
      const count = Number(input.equipmentCounts[eq.name] ?? 0);
      if (!count) return null;
      const adjustedHourly = eq.hourlyRate + eq.hourlyRate * colDelta;
      return {
        item: `E${index + 1}`,
        className: eq.class,
        name: eq.name,
        count,
        baseHourly: eq.hourlyRate,
        adjustedHourly,
        daily: adjustedHourly * factors.dailyHours,
        weekly: adjustedHourly * factors.weeklyHours,
        monthly: adjustedHourly * factors.monthlyHours,
      } satisfies ComputedEquipment;
    })
    .filter((row): row is ComputedEquipment => row !== null);
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
