import type { EstimateInput } from "../domain/entities/Estimate";
import type { PersonnelSlotData } from "../domain/entities/PersonnelSlot";

/**
 * Encapsulation: immutable draft updater for EstimateInput form state.
 * Keeps mutation rules out of React components (single place to evolve fields).
 */
export class EstimateDraft {
  private readonly value: EstimateInput;

  constructor(value: EstimateInput) {
    this.value = value;
  }

  get current(): EstimateInput {
    return this.value;
  }

  setField<K extends keyof EstimateInput>(
    key: K,
    next: EstimateInput[K],
  ): EstimateInput {
    return { ...this.value, [key]: next };
  }

  patchPersonnel(
    index: number,
    patch: Partial<PersonnelSlotData>,
  ): EstimateInput {
    const personnel = this.value.personnel.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    return { ...this.value, personnel };
  }

  setEquipmentCount(name: string, count: number): EstimateInput {
    return {
      ...this.value,
      equipmentCounts: {
        ...this.value.equipmentCounts,
        [name]: Math.max(0, count),
      },
    };
  }

  setAdditionalTerm(index: number, text: string): EstimateInput {
    const additionalTerms = [...this.value.additionalTerms];
    additionalTerms[index] = text;
    return { ...this.value, additionalTerms };
  }
}
