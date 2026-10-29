/**
 * Entity: one personnel slot on the estimate form.
 * Keeps role / name / salary together and knows when it is blank.
 */
export class PersonnelSlot {
  role: string;
  name: string;
  salary: number | "";

  constructor(role = "", name = "", salary: number | "" = "") {
    this.role = role;
    this.name = name;
    this.salary = salary;
  }

  isEmpty(): boolean {
    const salary =
      typeof this.salary === "number" ? this.salary : Number(this.salary) || 0;
    return !this.role && !this.name && !salary;
  }

  numericSalary(): number {
    return typeof this.salary === "number"
      ? this.salary
      : Number(this.salary) || 0;
  }

  withPatch(patch: Partial<Pick<PersonnelSlot, "role" | "name" | "salary">>): PersonnelSlot {
    return new PersonnelSlot(
      patch.role ?? this.role,
      patch.name ?? this.name,
      patch.salary ?? this.salary,
    );
  }

  toJSON(): { role: string; name: string; salary: number | "" } {
    return { role: this.role, name: this.name, salary: this.salary };
  }

  static fromJSON(data: {
    role?: string;
    name?: string;
    salary?: number | "";
  }): PersonnelSlot {
    return new PersonnelSlot(data.role ?? "", data.name ?? "", data.salary ?? "");
  }

  static emptySlots(count = 7): PersonnelSlot[] {
    return Array.from({ length: count }, () => new PersonnelSlot());
  }
}

/** Plain data shape for React form state / JSON persistence. */
export type PersonnelSlotData = {
  role: string;
  name: string;
  salary: number | "";
};
