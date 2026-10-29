import type { ColAdjustment } from "../valueObjects/ColAdjustment";
import { LineItem } from "./LineItem";
import type { EquipmentRow, ReferenceCatalog } from "../../catalogs/ReferenceCatalog";

export type EquipmentLineSnapshot = {
  item: string;
  className: string;
  name: string;
  count: number;
  baseHourly: number;
  adjustedHourly: number;
  daily: number;
  weekly: number;
  monthly: number;
};

/**
 * Inheritance: equipment line item with COL-adjusted hourly / daily / weekly rates.
 */
export class EquipmentLine extends LineItem {
  readonly className: string;
  readonly count: number;
  readonly baseHourly: number;
  readonly adjustedHourly: number;
  readonly daily: number;
  readonly weekly: number;
  readonly monthly: number;

  private constructor(snapshot: EquipmentLineSnapshot) {
    super(snapshot.item, snapshot.name);
    this.className = snapshot.className;
    this.count = snapshot.count;
    this.baseHourly = snapshot.baseHourly;
    this.adjustedHourly = snapshot.adjustedHourly;
    this.daily = snapshot.daily;
    this.weekly = snapshot.weekly;
    this.monthly = snapshot.monthly;
  }

  static fromCatalogRow(
    eq: EquipmentRow,
    index: number,
    count: number,
    col: ColAdjustment,
    catalog: ReferenceCatalog,
  ): EquipmentLine | null {
    if (!count) return null;
    const adjustedHourly = col.apply(eq.hourlyRate);
    const factors = catalog.equipmentFactors;
    return new EquipmentLine({
      item: `E${index + 1}`,
      className: eq.class,
      name: eq.name,
      count,
      baseHourly: eq.hourlyRate,
      adjustedHourly,
      daily: adjustedHourly * factors.dailyHours,
      weekly: adjustedHourly * factors.weeklyHours,
      monthly: adjustedHourly * factors.monthlyHours,
    });
  }

  toSnapshot(): EquipmentLineSnapshot {
    return {
      item: this.item,
      className: this.className,
      name: this.name,
      count: this.count,
      baseHourly: this.baseHourly,
      adjustedHourly: this.adjustedHourly,
      daily: this.daily,
      weekly: this.weekly,
      monthly: this.monthly,
    };
  }
}
