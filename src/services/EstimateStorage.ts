import type { EstimateInput } from "../domain/entities/Estimate";
import { EstimateFactory } from "./EstimateFactory";

/**
 * Repository: persists EstimateInput in localStorage.
 * Abstracts storage details away from the UI layer.
 */
export class EstimateStorage {
  private readonly key: string;
  private readonly factory: EstimateFactory;

  constructor(
    key: string,
    factory: EstimateFactory = new EstimateFactory(),
  ) {
    this.key = key;
    this.factory = factory;
  }

  load(): EstimateInput {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return this.factory.createEmpty();
      return { ...this.factory.createEmpty(), ...JSON.parse(raw) };
    } catch {
      return this.factory.createEmpty();
    }
  }

  save(estimate: EstimateInput): void {
    localStorage.setItem(this.key, JSON.stringify(estimate));
  }

  exportJson(estimate: EstimateInput, computed: unknown): void {
    const blob = new Blob(
      [JSON.stringify({ estimate, computed }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${estimate.estimateNumber || "bidsheet"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
