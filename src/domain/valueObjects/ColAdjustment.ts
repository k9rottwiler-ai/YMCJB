/**
 * Value object: cost-of-living delta between base and project locations.
 * Encapsulates how COL indexes become an adjustment factor.
 */
export class ColAdjustment {
  readonly baseCol: number;
  readonly projectCol: number;
  readonly delta: number;

  constructor(baseCol: number, projectCol: number) {
    this.baseCol = baseCol;
    this.projectCol = projectCol;
    this.delta = (projectCol - baseCol) / 100;
  }

  /** Apply COL to a base rate (salary or hourly). */
  apply(base: number): number {
    return base + base * this.delta;
  }

  /** Ceiling-adjusted salary after COL (nearest $5,000). */
  adjustSalary(salary: number, significance = 5000): number {
    if (!salary) return 0;
    const adjusted = this.apply(salary);
    if (significance <= 0) return Math.ceil(adjusted);
    return Math.ceil(adjusted / significance) * significance;
  }
}
