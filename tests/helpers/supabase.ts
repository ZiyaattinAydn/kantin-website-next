export function singleRowChain<T>(result: { data: T | null; error: unknown }) {
  return {
    select: () => ({
      eq: () => ({
        single: async () => result,
      }),
    }),
  };
}

export function successfulInsertChain<T extends Record<string, unknown>>(
  buildRow: (payload: Record<string, unknown>) => T,
) {
  return {
    insert: (payload: Record<string, unknown>) => ({
      select: () => ({
        single: async () => ({ data: buildRow(payload), error: null }),
      }),
    }),
  };
}
