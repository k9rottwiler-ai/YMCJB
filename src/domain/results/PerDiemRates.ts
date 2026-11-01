/**
 * Encapsulated result: lodging and meals per diem at daily / weekly / monthly.
 */
export class PerDiemRates {
  readonly lodgingDaily: number;
  readonly lodgingWeekly: number;
  readonly lodgingMonthly: number;
  readonly mealsDaily: number;
  readonly mealsWeekly: number;
  readonly mealsMonthly: number;

  constructor(opts: {
    lodgingDaily: number;
    mealsDaily: number;
    includeLodging: boolean;
    includeMeals: boolean;
  }) {
    const lodging = opts.includeLodging ? opts.lodgingDaily : 0;
    const meals = opts.includeMeals ? opts.mealsDaily : 0;
    this.lodgingDaily = lodging;
    this.lodgingWeekly = lodging * 7;
    this.lodgingMonthly = lodging * 24;
    this.mealsDaily = meals;
    this.mealsWeekly = meals * 7;
    this.mealsMonthly = meals * 24;
  }

  toSnapshot() {
    return {
      lodgingDaily: this.lodgingDaily,
      lodgingWeekly: this.lodgingWeekly,
      lodgingMonthly: this.lodgingMonthly,
      mealsDaily: this.mealsDaily,
      mealsWeekly: this.mealsWeekly,
      mealsMonthly: this.mealsMonthly,
    };
  }
}
