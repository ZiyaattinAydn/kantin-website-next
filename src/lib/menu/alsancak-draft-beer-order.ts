/** Keep Alsancak's traditional draft-beer order independent of Supabase sort_order. */
const ALSANCAK_DRAFT_BEER_RANK = new Map([
  ["Efes Pilsen", 0],
  ["Becks", 1],
  ["Stella Artois", 2],
]);

export function sortAlsancakDraftBeers<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) =>
      (ALSANCAK_DRAFT_BEER_RANK.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
      (ALSANCAK_DRAFT_BEER_RANK.get(b.name) ?? Number.MAX_SAFE_INTEGER),
  );
}
