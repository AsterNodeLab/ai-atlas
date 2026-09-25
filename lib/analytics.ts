/**
 * Conceptual analytics events. No external service is wired in: events are
 * dispatched as DOM CustomEvents so a provider can be plugged in later
 * (listen to "atlas:analytics" on window).
 */
export type AnalyticsEvent =
  | { name: "term_view"; slug: string }
  | { name: "search"; query: string; results: number }
  | { name: "search_select"; query: string; slug: string }
  | { name: "related_term_click"; from: string; to: string }
  | { name: "learning_path_start"; path: string }
  | { name: "term_saved"; slug: string; saved: boolean };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("atlas:analytics", { detail: event }));
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", event);
}
