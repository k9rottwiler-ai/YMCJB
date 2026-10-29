import { Estimate } from "../domain/entities/Estimate";
import type { EstimateInput } from "../domain/entities/Estimate";
import type { ComputedEstimateSnapshot } from "../domain/results/ComputedEstimate";
import { ReferenceCatalog } from "../catalogs/ReferenceCatalog";

/**
 * Application service: thin façade that turns EstimateInput into a snapshot
 * for React. Keeps components dependent on a stable service API.
 */
export class EstimateCalculator {
  private readonly catalog: ReferenceCatalog;

  constructor(catalog: ReferenceCatalog = ReferenceCatalog.getInstance()) {
    this.catalog = catalog;
  }

  compute(input: EstimateInput): ComputedEstimateSnapshot {
    return Estimate.fromInput(input).compute(this.catalog).toSnapshot();
  }
}
