export const RELEASE_CLEANUP_PATHS: readonly string[];
export function assertKantinProjectRoot(root: string): string;
export function findReleaseCleanupTargets(root: string): string[];
export function removeReleaseCleanupTargets(root: string): string[];
