import type { Branch } from "@/types/domain";

export const branches = [
  {
    id: "alsancak",
    code: "ALS",
    name: "Alsancak",
    addressLine: "1464. Sokak No:71/A",
    district: "Alsancak, Konak",
    city: "İzmir",
    mapsUrl:
      "https://maps.app.goo.gl/qZYRVGAkhtbVA2Fu7?g_st=ic",
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
      "https://maps.app.goo.gl/Q6522YB6XoKSReYw8?g_st=ipc",
    features: ["Kokteyl", "Grill", "Bahçe"],
    active: true,
    sortOrder: 2,
  },
] as const satisfies readonly Branch[];

export const branchById = Object.fromEntries(
  branches.map((branch) => [branch.id, branch]),
) as Record<string, (typeof branches)[number]>;
