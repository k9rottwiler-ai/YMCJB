/**
 * Utility formatters (stateless helpers used by presentation).
 */
export class Formatters {
  static money(value: number, digits = 0): string {
    if (!Number.isFinite(value) || value === 0) return "—";
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  static pct(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  static date(value: string): string {
    if (!value) return "—";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export const money = Formatters.money.bind(Formatters);
export const pct = Formatters.pct.bind(Formatters);
