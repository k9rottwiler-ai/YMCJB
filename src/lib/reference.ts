import bundled from "../data/reference.json";
import type { OtStructure, ProfitTier } from "./types";
import { useSyncExternalStore } from "react";

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

export type WageParams = {
  pyaddr: number;
  ovt: number;
  ovtPyaDisc: number;
  multipliers: Record<string, number>;
  contingency40st5ot: number;
  contingency40st10ot: number;
};

export type ReferenceData = {
  wageParams: WageParams;
  wages: WageRow[];
  equipment: EquipmentRow[];
  equipmentFactors: EquipmentFactors;
  states: StateRow[];
  profitTiers: ProfitTier[];
  otStructures: OtStructure[];
  standardTerms: string[];
};

export const REFERENCE_STORAGE_KEY = "bidsheet-reference-v1";

const DEFAULT_REFERENCE = structuredClone(bundled) as ReferenceData;

let current: ReferenceData = loadFromStorage() ?? cloneReference(DEFAULT_REFERENCE);
const listeners = new Set<() => void>();

function cloneReference(data: ReferenceData): ReferenceData {
  return structuredClone(data);
}

function emit() {
  for (const listener of listeners) listener();
}

function loadFromStorage(): ReferenceData | null {
  try {
    const raw = localStorage.getItem(REFERENCE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeReference(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function subscribeReference(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getReference(): ReferenceData {
  return current;
}

export function getDefaultReference(): ReferenceData {
  return cloneReference(DEFAULT_REFERENCE);
}

export function hasReferenceOverrides(): boolean {
  try {
    return Boolean(localStorage.getItem(REFERENCE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function setReference(next: ReferenceData, persist = true): void {
  current = cloneReference(normalizeReference(next));
  if (persist) {
    localStorage.setItem(REFERENCE_STORAGE_KEY, JSON.stringify(current));
  }
  emit();
}

export function resetReferenceToDefaults(): void {
  localStorage.removeItem(REFERENCE_STORAGE_KEY);
  current = cloneReference(DEFAULT_REFERENCE);
  emit();
}

export function useReference(): ReferenceData {
  return useSyncExternalStore(subscribeReference, getReference, getDefaultReference);
}

function asFinite(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeReference(raw: unknown): ReferenceData {
  const base = cloneReference(DEFAULT_REFERENCE);
  if (!raw || typeof raw !== "object") return base;
  const parsed = raw as Partial<ReferenceData>;

  const wages = Array.isArray(parsed.wages)
    ? parsed.wages
        .map((row) => ({
          wageYr: asFinite(row?.wageYr),
          wageHr: asFinite(row?.wageHr),
          category: String(row?.category ?? "").trim(),
          stPrice: asFinite(row?.stPrice),
          otPrice: asFinite(row?.otPrice),
          st5ot: asFinite(row?.st5ot),
          st10ot: asFinite(row?.st10ot),
        }))
        .filter((row) => row.category && row.wageYr > 0)
    : base.wages;

  const states = Array.isArray(parsed.states)
    ? parsed.states
        .map((row) => ({
          name: String(row?.name ?? "").trim(),
          abbr: String(row?.abbr ?? "").trim().toUpperCase(),
          lodging: asFinite(row?.lodging),
          meals: asFinite(row?.meals),
          colIndex: asFinite(row?.colIndex, 100),
        }))
        .filter((row) => row.name && row.abbr)
    : base.states;

  const equipment = Array.isArray(parsed.equipment)
    ? parsed.equipment
        .map((row) => ({
          class: String(row?.class ?? "").trim() || "Custom",
          name: String(row?.name ?? "").trim(),
          hourlyRate: asFinite(row?.hourlyRate),
        }))
        .filter((row) => row.name && row.hourlyRate > 0)
    : base.equipment;

  const factors = parsed.equipmentFactors ?? base.equipmentFactors;

  return {
    wageParams: { ...base.wageParams, ...(parsed.wageParams ?? {}) },
    wages,
    equipment,
    equipmentFactors: {
      dailyHours: asFinite(factors.dailyHours, 8),
      weeklyHours: asFinite(factors.weeklyHours, 40),
      monthlyHours: asFinite(factors.monthlyHours, 140),
    },
    states,
    profitTiers: Array.isArray(parsed.profitTiers) && parsed.profitTiers.length
      ? (parsed.profitTiers as ProfitTier[])
      : base.profitTiers,
    otStructures: Array.isArray(parsed.otStructures) && parsed.otStructures.length
      ? (parsed.otStructures as OtStructure[])
      : base.otStructures,
    standardTerms: Array.isArray(parsed.standardTerms) && parsed.standardTerms.length
      ? parsed.standardTerms.map(String)
      : base.standardTerms,
  };
}

/** Parse CSV text into rows of string records (header → values). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    // Skip fully empty trailing rows
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      pushCell();
      continue;
    }
    if (ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  pushCell();
  pushRow();

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (values[index] ?? "").trim();
    });
    return record;
  });
}

export function toCsv(headers: string[], rows: Record<string, string | number>[]): string {
  const escape = (value: string | number) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
    return text;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export const WAGE_CSV_HEADERS = [
  "category",
  "wageYr",
  "wageHr",
  "stPrice",
  "otPrice",
  "st5ot",
  "st10ot",
] as const;

export const STATE_CSV_HEADERS = [
  "name",
  "abbr",
  "lodging",
  "meals",
  "colIndex",
] as const;

export const EQUIPMENT_CSV_HEADERS = ["class", "name", "hourlyRate"] as const;

export function wagesToCsv(wages: WageRow[]): string {
  return toCsv(
    [...WAGE_CSV_HEADERS],
    wages.map((row) => ({ ...row })),
  );
}

export function statesToCsv(states: StateRow[]): string {
  return toCsv(
    [...STATE_CSV_HEADERS],
    states.map((row) => ({ ...row })),
  );
}

export function equipmentToCsv(equipment: EquipmentRow[]): string {
  return toCsv(
    [...EQUIPMENT_CSV_HEADERS],
    equipment.map((row) => ({ ...row })),
  );
}

export function parseWagesCsv(text: string): { rows: WageRow[]; errors: string[] } {
  const records = parseCsv(text);
  const errors: string[] = [];
  if (records.length === 0) {
    return { rows: [], errors: ["No wage rows found in CSV."] };
  }
  const missing = WAGE_CSV_HEADERS.filter((h) => !(h in records[0]));
  if (missing.length) {
    return {
      rows: [],
      errors: [`Missing wage CSV columns: ${missing.join(", ")}`],
    };
  }
  const rows: WageRow[] = [];
  records.forEach((record, index) => {
    const category = record.category?.trim();
    const wageYr = asFinite(record.wageYr);
    if (!category || !wageYr) {
      errors.push(`Row ${index + 2}: category and wageYr are required.`);
      return;
    }
    rows.push({
      category,
      wageYr,
      wageHr: asFinite(record.wageHr),
      stPrice: asFinite(record.stPrice),
      otPrice: asFinite(record.otPrice),
      st5ot: asFinite(record.st5ot),
      st10ot: asFinite(record.st10ot),
    });
  });
  return { rows, errors };
}

export function parseStatesCsv(text: string): { rows: StateRow[]; errors: string[] } {
  const records = parseCsv(text);
  const errors: string[] = [];
  if (records.length === 0) {
    return { rows: [], errors: ["No state rows found in CSV."] };
  }
  const missing = STATE_CSV_HEADERS.filter((h) => !(h in records[0]));
  if (missing.length) {
    return {
      rows: [],
      errors: [`Missing state CSV columns: ${missing.join(", ")}`],
    };
  }
  const rows: StateRow[] = [];
  records.forEach((record, index) => {
    const name = record.name?.trim();
    const abbr = record.abbr?.trim().toUpperCase();
    if (!name || !abbr) {
      errors.push(`Row ${index + 2}: name and abbr are required.`);
      return;
    }
    rows.push({
      name,
      abbr,
      lodging: asFinite(record.lodging),
      meals: asFinite(record.meals),
      colIndex: asFinite(record.colIndex, 100),
    });
  });
  return { rows, errors };
}

export function parseEquipmentCsv(text: string): {
  rows: EquipmentRow[];
  errors: string[];
} {
  const records = parseCsv(text);
  const errors: string[] = [];
  if (records.length === 0) {
    return { rows: [], errors: ["No equipment rows found in CSV."] };
  }
  const missing = EQUIPMENT_CSV_HEADERS.filter((h) => !(h in records[0]));
  if (missing.length) {
    return {
      rows: [],
      errors: [`Missing equipment CSV columns: ${missing.join(", ")}`],
    };
  }
  const rows: EquipmentRow[] = [];
  records.forEach((record, index) => {
    const name = record.name?.trim();
    const hourlyRate = asFinite(record.hourlyRate);
    if (!name || hourlyRate <= 0) {
      errors.push(`Row ${index + 2}: name and hourlyRate (> 0) are required.`);
      return;
    }
    rows.push({
      class: record.class?.trim() || "Custom",
      name,
      hourlyRate,
    });
  });
  return { rows, errors };
}

export function downloadTextFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function emptyWageTemplateCsv(): string {
  return toCsv([...WAGE_CSV_HEADERS], [
    {
      category: "MED",
      wageYr: 100000,
      wageHr: 48.0769,
      stPrice: 141,
      otPrice: 210,
      st5ot: 171,
      st10ot: 195,
    },
  ]);
}

export function emptyStateTemplateCsv(): string {
  return toCsv([...STATE_CSV_HEADERS], [
    {
      name: "Texas",
      abbr: "TX",
      lodging: 144,
      meals: 76,
      colIndex: 90.8,
    },
  ]);
}

export function emptyEquipmentTemplateCsv(): string {
  return toCsv([...EQUIPMENT_CSV_HEADERS], [
    { class: "Truck", name: "3/4 Ton 4wd Truck", hourlyRate: 35 },
  ]);
}
