/**
 * Abstraction / Inheritance base: shared identity for priced line items.
 * Subclasses encapsulate how each line is computed and serialized.
 */
export abstract class LineItem {
  readonly item: string;
  readonly name: string;

  protected constructor(item: string, name: string) {
    this.item = item;
    this.name = name;
  }

  abstract toSnapshot(): Record<string, unknown>;
}
