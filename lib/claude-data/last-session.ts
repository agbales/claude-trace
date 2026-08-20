// Shared localStorage key convention between the write side (SessionVisitTracker,
// on every session page visit) and the read side (DefaultSessionRedirect, on a
// bare project URL) — keeps "remember the last conversation per project" in one
// place rather than duplicating the key string.
export function lastSessionKey(projectDir: string): string {
  return `claude-trace:last-session:${projectDir}`;
}
