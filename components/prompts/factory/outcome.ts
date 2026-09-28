/**
 * Every engine call from the UI goes through `attempt` so an unexpected throw
 * becomes an inline message instead of taking down the whole tool.
 */
export type Outcome<T> = { ok: true; value: T } | { ok: false; error: string };

export function attempt<T>(fn: () => T): Outcome<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
