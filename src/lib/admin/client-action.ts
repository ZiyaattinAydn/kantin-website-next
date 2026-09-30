export async function runAdminAction<
  T extends { ok: boolean; message: string },
>(
  action: () => Promise<T>,
  fallback: string,
): Promise<T | { ok: false; message: string }> {
  try {
    return await action();
  } catch {
    return { ok: false, message: fallback };
  }
}
