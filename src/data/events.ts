import { branchById } from "./branches";
import type { EventBranchId } from "@/types/domain";

export const eventBranchLabels: Record<EventBranchId, string> = {
  alsancak: branchById.alsancak.name,
  atakent: branchById.atakent.name,
  both: "İki şube",
};

export const eventBranchAddresses: Record<EventBranchId, string> = {
  alsancak: `${branchById.alsancak.addressLine}, ${branchById.alsancak.district} / ${branchById.alsancak.city}`,
  atakent: `${branchById.atakent.addressLine}, ${branchById.atakent.district} / ${branchById.atakent.city}`,
  both: `${branchById.alsancak.name} + ${branchById.atakent.name}`,
};

export const eventFilters = [
  { value: "all", label: "Tümü" },
  { value: "alsancak", label: branchById.alsancak.name },
  { value: "atakent", label: branchById.atakent.name },
] as const;
