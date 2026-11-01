import { ReferenceCatalog } from "../catalogs/ReferenceCatalog";
import { PersonnelSlot } from "../domain/entities/PersonnelSlot";
import type { EstimateInput } from "../domain/entities/Estimate";

/**
 * Factory: constructs blank and demo EstimateInput instances.
 * Keeps creation rules out of React components.
 */
export class EstimateFactory {
  private readonly catalog: ReferenceCatalog;

  constructor(catalog: ReferenceCatalog = ReferenceCatalog.getInstance()) {
    this.catalog = catalog;
  }

  createEmpty(): EstimateInput {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: crypto.randomUUID(),
      estimatorName: "",
      estimatorPhone: "",
      estimatorEmail: "",
      estimateDate: today,
      estimateNumber: `TE-${today.replaceAll("-", "")}-001`,
      customerName: "",
      projectAddress: "",
      clientPhone: "",
      clientEmail: "",
      projectScope: "",
      mobilizationDate: "",
      startDate: "",
      finishDate: "",
      closeOutDate: "",
      projectState: "Texas",
      baseState: "Texas",
      otStructure: "OT Billed Separately",
      stProfit: "MED",
      otProfit: "MED",
      personnel: PersonnelSlot.emptySlots().map((s) => s.toJSON()),
      equipmentCounts: this.catalog.emptyEquipmentCounts(),
      includeLodging: true,
      includeMeals: true,
      rentalVehicle: "",
      airFare: "",
      rentalEquipment: "",
      supportPurchases: "",
      backgroundScreenings: "",
      includeStandByTerm: true,
      includeHolidayTerm: true,
      additionalTerms: ["", "", "", ""],
    };
  }

  createDemo(): EstimateInput {
    const base = this.createEmpty();
    return {
      ...base,
      estimatorName: "Alex Rivera",
      estimatorPhone: "(555) 201-4488",
      estimatorEmail: "alex.rivera@example.com",
      customerName: "Summit Pipeline Partners",
      projectAddress: "1840 County Rd 12, Midland, TX 79701",
      clientPhone: "(432) 555-0199",
      clientEmail: "procurement@summitpipe.example",
      projectScope:
        "Provide time-and-equipment support for ROW restoration and temporary access maintenance, including supervision, labor, trucks, and mini-ex support as directed by the client representative.",
      mobilizationDate: base.estimateDate,
      startDate: base.estimateDate,
      finishDate: "",
      closeOutDate: "",
      projectState: "Texas",
      baseState: "Oklahoma",
      otStructure: "OT Billed Separately",
      stProfit: "MED",
      otProfit: "HIGH",
      personnel: [
        { role: "Superintendent", name: "Jordan Lee", salary: 120000 },
        { role: "Foreman", name: "Casey Nguyen", salary: 95000 },
        { role: "Equipment Operator", name: "Riley Brooks", salary: 80000 },
        { role: "", name: "", salary: "" },
        { role: "", name: "", salary: "" },
        { role: "", name: "", salary: "" },
        { role: "", name: "", salary: "" },
      ],
      equipmentCounts: {
        ...base.equipmentCounts,
        "3/4 Ton 4wd Truck": 2,
        "10K Mini Ex w/Trailer": 1,
        "Skidsteer w/Trailer": 1,
      },
      rentalVehicle: "As needed for crew transport",
      additionalTerms: [
        "Mobilization and demobilization billed at straight-time rates unless otherwise agreed in writing.",
        "",
        "",
        "",
      ],
    };
  }
}
