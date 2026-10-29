import type { PersonnelSlot } from "../entities/PersonnelSlot";
import type { ColAdjustment } from "../valueObjects/ColAdjustment";
import type { ProfitTier } from "../valueObjects/ProfitTier";
import type { OtBillingStrategy } from "../strategies/OtBillingStrategy";
import { LineItem } from "./LineItem";
import type { ReferenceCatalog } from "../../catalogs/ReferenceCatalog";

export type PersonnelLineSnapshot = {
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
};

/**
 * Inheritance: personnel line item priced from the wage schedule.
 * Encapsulates COL-adjusted salary lookup + OT billing strategy.
 */
export class PersonnelLine extends LineItem {
  readonly role: string;
  readonly salary: number;
  readonly colAdjustment: number;
  readonly adjustedSalary: number;
  readonly stPrice: number;
  readonly otPrice: number;
  readonly st5ot: number;
  readonly st10ot: number;
  readonly billedSt: number;
  readonly billedOt: number;

  private constructor(snapshot: PersonnelLineSnapshot) {
    super(snapshot.item, snapshot.name);
    this.role = snapshot.role;
    this.salary = snapshot.salary;
    this.colAdjustment = snapshot.colAdjustment;
    this.adjustedSalary = snapshot.adjustedSalary;
    this.stPrice = snapshot.stPrice;
    this.otPrice = snapshot.otPrice;
    this.st5ot = snapshot.st5ot;
    this.st10ot = snapshot.st10ot;
    this.billedSt = snapshot.billedSt;
    this.billedOt = snapshot.billedOt;
  }

  static fromSlot(
    slot: PersonnelSlot,
    index: number,
    col: ColAdjustment,
    stProfit: ProfitTier,
    otProfit: ProfitTier,
    billing: OtBillingStrategy,
    catalog: ReferenceCatalog,
  ): PersonnelLine | null {
    if (slot.isEmpty()) return null;

    const salary = slot.numericSalary();
    const adjustedSalary = col.adjustSalary(salary);
    const stRow = catalog.lookupWage(stProfit, adjustedSalary);
    const otRow = catalog.lookupWage(otProfit, adjustedSalary);
    const rates = {
      stPrice: stRow?.stPrice ?? 0,
      otPrice: otRow?.otPrice ?? 0,
      st5ot: stRow?.st5ot ?? 0,
      st10ot: otRow?.st10ot ?? 0,
    };
    const billed = billing.resolve(rates);

    return new PersonnelLine({
      item: `M${index + 1}`,
      name: slot.name,
      role: slot.role,
      salary,
      colAdjustment: col.delta,
      adjustedSalary,
      ...rates,
      ...billed,
    });
  }

  toSnapshot(): PersonnelLineSnapshot {
    return {
      item: this.item,
      name: this.name,
      role: this.role,
      salary: this.salary,
      colAdjustment: this.colAdjustment,
      adjustedSalary: this.adjustedSalary,
      stPrice: this.stPrice,
      otPrice: this.otPrice,
      st5ot: this.st5ot,
      st10ot: this.st10ot,
      billedSt: this.billedSt,
      billedOt: this.billedOt,
    };
  }
}
