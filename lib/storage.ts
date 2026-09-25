"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed stores (saved terms, recently viewed).
 * The storage layer is isolated here so a future account/sync backend can replace it.
 */
const CHANGE_EVENT = "atlas:storage";
const SAVED = "atlas:saved";
const RECENT = "atlas:recent";
const RECENT_LIMIT = 12;

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota): the feature degrades silently.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function useList(key: string): string[] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => "[]");
  return useMemo(() => parse(raw), [raw]);
}

export function useSavedTerms(): string[] {
  return useList(SAVED);
}

export function useRecentTerms(): string[] {
  return useList(RECENT);
}

export function toggleSaved(slug: string): boolean {
  const list = parse(read(SAVED));
  const saved = !list.includes(slug);
  write(SAVED, saved ? [slug, ...list] : list.filter((s) => s !== slug));
  return saved;
}

export function pushRecent(slug: string) {
  const list = parse(read(RECENT)).filter((s) => s !== slug);
  write(RECENT, [slug, ...list].slice(0, RECENT_LIMIT));
}

export function clearRecent() {
  write(RECENT, []);
}
