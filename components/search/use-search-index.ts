"use client";

import { useEffect, useState } from "react";
import { buildIndex, type IndexedDocument } from "@/lib/search";
import type { SearchDocument } from "@/types/glossary";

/**
 * The search index is a static JSON file (/search-index.json) generated at build time.
 * It is fetched once, lazily, and cached for the whole session.
 */
let cache: IndexedDocument[] | null = null;
let pending: Promise<IndexedDocument[]> | null = null;

export function loadSearchIndex(): Promise<IndexedDocument[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search-index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`search index: ${r.status}`);
        return r.json() as Promise<SearchDocument[]>;
      })
      .then((docs) => {
        cache = buildIndex(docs);
        return cache;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

export function useSearchIndex(): { index: IndexedDocument[] | null; error: boolean } {
  const [index, setIndex] = useState<IndexedDocument[] | null>(cache);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadSearchIndex().then(
      (i) => alive && setIndex(i),
      () => alive && setError(true),
    );
    return () => {
      alive = false;
    };
  }, []);
  return { index, error };
}
