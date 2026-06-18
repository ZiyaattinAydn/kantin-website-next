import type { Branch, BranchId } from "@/types/domain";

export const branches = [
  {
    id: "alsancak",
    code: "ALS",
    name: "Alsancak",
    addressLine: "1464. Sokak No:71/A",
    district: "Alsancak, Konak",
    city: "İzmir",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Kantin+Izmir+1464+Sokak+71A+Alsancak+Konak+Izmir",
    features: ["Self-servis", "Bira", "Kahve Barı"],
    active: true,
    sortOrder: 1,
  },
  {
    id: "atakent",
    code: "ATA",
    name: "Atakent",
    addressLine: "2035 Sokak No:6",
    district: "Atakent, Karşıyaka",
    city: "İzmir",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Kantin+Atakent+2035+Sokak+6+Atakent+Karsiyaka+Izmir",
    features: ["Kokteyl", "Grill", "Bahçe"],
    active: true,
    sortOrder: 2,
  },
] as const satisfies readonly Branch[];

export const branchById = Object.fromEntries(
  branches.map((branch) => [branch.id, branch]),
) as Record<BranchId, (typeof branches)[number]>;
