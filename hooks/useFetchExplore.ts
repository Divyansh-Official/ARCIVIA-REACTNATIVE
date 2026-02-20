import { useCallback, useEffect, useRef, useState } from "react";

// ─── MET MUSEUM API ──────────────────────────────────────────────────────────
// Free, no API key needed. Rate limit: 80 req/sec.
// Docs: https://metmuseum.github.io
const MET_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

// ─── DEPARTMENT → CATEGORY MAPPING ───────────────────────────────────────────
// Full dept list from: GET /public/collection/v1/departments
const DEPARTMENT_IDS: Record<string, number[]> = {
  all: [3, 6, 10, 11, 12, 13, 14, 17],
  trending: [10, 13, 11], // Egyptian, Greek/Roman, European Paintings
  ancient: [3, 10, 13], // Near Eastern, Egyptian, Greek & Roman
  medieval: [7, 17], // The Cloisters, Medieval Art
  artifacts: [3, 4, 6, 10, 13, 14],
  monuments: [11, 12, 13, 17],
  museums: [1, 8, 15, 19],
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface HeritageItem {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  culture: string;
  imageUrl: string;
  views: number;
  likes: number;
  isAR: boolean;
  category: string;
  location: string;
  description: string;
  tags: string[];
  objectURL?: string;
}

export interface FetchFilters {
  era: string[];
  culture: string[];
  arOnly: boolean;
  sortBy: "popular" | "newest" | "oldest";
}

interface MetObject {
  objectID: number;
  isHighlight: boolean;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  title: string;
  culture: string;
  period: string;
  dynasty: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  medium: string;
  dimensions: string;
  country: string;
  city: string;
  region: string;
  department: string;
  objectName: string;
  creditLine: string;
  objectURL: string;
  tags?: { term: string }[];
  classification: string;
}

// ─── TRANSFORM: MetObject → HeritageItem ─────────────────────────────────────
const toHeritageItem = (obj: MetObject, category: string): HeritageItem => {
  // Build era string
  const periodPart = obj.period || obj.dynasty || "";
  const yearPart =
    obj.objectBeginDate !== 0
      ? obj.objectBeginDate < 0
        ? `${Math.abs(obj.objectBeginDate)} BC`
        : `${obj.objectBeginDate} AD`
      : obj.objectDate || "";
  const era =
    [periodPart, yearPart].filter(Boolean).join(" · ") || "Unknown Period";

  // Location
  const location =
    [obj.city, obj.country, obj.region].filter(Boolean).join(", ") ||
    "The Metropolitan Museum of Art";

  // Culture
  const culture =
    obj.culture || obj.artistDisplayName || obj.department || "Unknown Culture";

  // Tags
  const tags =
    obj.tags && obj.tags.length > 0
      ? obj.tags.map((t) => t.term.toLowerCase())
      : [obj.classification, obj.objectName, obj.medium]
          .filter(Boolean)
          .map((s) => s.toLowerCase().split(" ")[0]);

  // Description
  const descParts = [
    obj.objectName && `Object type: ${obj.objectName}.`,
    obj.medium && `Medium: ${obj.medium}.`,
    obj.dimensions && `Dimensions: ${obj.dimensions}.`,
    obj.creditLine,
    obj.artistDisplayBio && `Artist: ${obj.artistDisplayBio}.`,
  ].filter(Boolean);

  return {
    id: String(obj.objectID),
    title: obj.title || "Untitled Work",
    subtitle: obj.objectName || obj.classification || "",
    era,
    culture,
    // Prefer full-res; fall back to web-large thumbnail
    imageUrl: obj.primaryImage || obj.primaryImageSmall,
    views: Math.floor(Math.random() * 500_000) + 10_000,
    likes: Math.floor(Math.random() * 20_000) + 100,
    // Use isHighlight as the AR flag — swap with your own AR asset check
    isAR: obj.isHighlight,
    category,
    location,
    description: descParts.join(" ") || "No description available.",
    tags: tags.slice(0, 6),
    objectURL: obj.objectURL,
  };
};

// ─── LOW-LEVEL FETCHERS ───────────────────────────────────────────────────────

/** Fetch a single object by ID; returns null if it has no image */
async function fetchObject(
  id: number,
  signal?: AbortSignal,
): Promise<MetObject | null> {
  try {
    const res = await fetch(`${MET_BASE}/objects/${id}`, { signal });
    if (!res.ok) return null;
    const obj: MetObject = await res.json();
    return obj.primaryImage || obj.primaryImageSmall ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Fetch a batch of IDs in parallel, discarding any without images.
 * Fetches `ids` in chunks to avoid hammering the rate limit.
 */
async function fetchObjectsBatch(
  ids: number[],
  category: string,
  signal?: AbortSignal,
): Promise<HeritageItem[]> {
  const CHUNK = 10;
  const results: HeritageItem[] = [];

  for (let i = 0; i < ids.length; i += CHUNK) {
    if (signal?.aborted) break;
    const chunk = ids.slice(i, i + CHUNK);
    const settled = await Promise.allSettled(
      chunk.map((id) => fetchObject(id, signal)),
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value) {
        results.push(toHeritageItem(r.value, category));
      }
    }
    // Yield to avoid rate-limit bursts
    if (i + CHUNK < ids.length) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  return results;
}

/**
 * Get object IDs either via search (if searchQuery) or by department listing.
 * Returns a flat list of IDs sized for one page.
 */
async function resolveObjectIDs(
  category: string,
  searchQuery: string,
  filters: FetchFilters,
  page: number,
  signal?: AbortSignal,
): Promise<number[]> {
  const PAGE_SIZE = 20;
  const OVERSAMPLE = 3; // fetch 3× to account for imageless records

  if (searchQuery.trim()) {
    // ── Search endpoint ────────────────────────────────────────────────
    const params = new URLSearchParams({
      q: searchQuery.trim(),
      hasImages: "true",
    });
    if (filters.arOnly) params.set("isHighlight", "true");
    if (filters.era.length === 1) {
      // Approximate era → date ranges
      const eraDateMap: Record<string, [number, number]> = {
        Prehistoric: [-3000, -1000],
        Ancient: [-1000, 500],
        Medieval: [500, 1500],
        Renaissance: [1400, 1700],
        Modern: [1700, 2000],
      };
      const range = eraDateMap[filters.era[0]];
      if (range) {
        params.set("dateBegin", String(range[0]));
        params.set("dateEnd", String(range[1]));
      }
    }
    if (filters.culture.length > 0) {
      // Culture search overrides q
      params.set("q", filters.culture[0]);
      params.set("artistOrCulture", "true");
    }

    const res = await fetch(`${MET_BASE}/search?${params}`, { signal });
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    const ids: number[] = data.objectIDs ?? [];
    const start = (page - 1) * PAGE_SIZE * OVERSAMPLE;
    return ids.slice(start, start + PAGE_SIZE * OVERSAMPLE);
  }

  // ── Department listing ────────────────────────────────────────────────
  const depts = DEPARTMENT_IDS[category] ?? DEPARTMENT_IDS.all;
  // Rotate which department we pull from each page for variety
  const deptId = depts[(page - 1) % depts.length];

  const res = await fetch(`${MET_BASE}/objects?departmentIds=${deptId}`, {
    signal,
  });
  if (!res.ok) throw new Error("Department fetch failed");
  const data = await res.json();
  const ids: number[] = data.objectIDs ?? [];

  // Stagger starting offset by page to avoid always returning the same items
  const stride = PAGE_SIZE * OVERSAMPLE;
  const start = ((page - 1) * stride * 2) % Math.max(ids.length - stride, 1);
  return ids.slice(start, start + stride);
}

// ─── HOOK: useFetchExplore ────────────────────────────────────────────────────
export const useFetchExplore = (
  category: string,
  filters: FetchFilters,
  searchQuery: string = "",
) => {
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (pageNum: number, isRefresh = false) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        if (pageNum === 1) isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const ids = await resolveObjectIDs(
          category,
          searchQuery,
          filters,
          pageNum,
          ctrl.signal,
        );

        if (ids.length === 0) {
          setHasMore(false);
          return;
        }

        const fetched = await fetchObjectsBatch(ids, category, ctrl.signal);

        // Apply arOnly client-side (isHighlight check)
        const display = filters.arOnly
          ? fetched.filter((i) => i.isAR)
          : fetched;

        setItems((prev) => (pageNum === 1 ? display : [...prev, ...display]));
        setHasMore(ids.length >= 20);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message ?? "Something went wrong. Pull down to retry.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, filters, searchQuery],
  );

  // Reset + reload when category/filters/search change
  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    load(1);
    return () => abortRef.current?.abort();
  }, [category, filters, searchQuery]);

  // Paginate
  useEffect(() => {
    if (page > 1) load(page);
  }, [page]);

  return {
    items,
    featured: items.slice(0, 3),
    trending: items.slice(0, 8),
    loading,
    refreshing,
    error,
    hasMore,
    fetchNextPage: () => {
      if (hasMore && !loading && !refreshing) setPage((p) => p + 1);
    },
    refresh: () => {
      setPage(1);
      setItems([]);
      load(1, true);
    },
  };
};

// ─── HOOK: useFetchItemDetail ─────────────────────────────────────────────────
export const useFetchItemDetail = (id: string) => {
  const [item, setItem] = useState<HeritageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<HeritageItem[]>([]);
  const [rawObject, setRawObject] = useState<MetObject | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        // 1. Fetch the main object
        const obj = await fetchObject(Number(id));
        if (!obj || cancelled) return;
        setRawObject(obj);
        setItem(toHeritageItem(obj, "artifacts"));

        // 2. Find related via culture/tag/department search
        const searchTerm =
          obj.culture || obj.tags?.[0]?.term || obj.department || "ancient";

        const res = await fetch(
          `${MET_BASE}/search?q=${encodeURIComponent(searchTerm)}&hasImages=true`,
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();

        const relIds: number[] = (data.objectIDs ?? [])
          .filter((rid: number) => rid !== Number(id))
          .slice(0, 40);

        const related = await fetchObjectsBatch(relIds, "artifacts");
        if (!cancelled) {
          setRelatedItems(related.filter((r) => r.id !== id).slice(0, 6));
        }
      } catch (e) {
        console.error("[useFetchItemDetail]", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading, relatedItems, rawObject };
};

// ─── HOOK: useFetchHighlights ─────────────────────────────────────────────────
// Fetches Met "isHighlight" works — perfect for the featured hero cards
export const useFetchHighlights = (query = "ancient") => {
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          `${MET_BASE}/search?isHighlight=true&hasImages=true&q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        const ids: number[] = (data.objectIDs ?? []).slice(0, 40);
        const fetched = await fetchObjectsBatch(ids, "featured");
        if (!cancelled) setItems(fetched.slice(0, 10));
      } catch (e) {
        console.error("[useFetchHighlights]", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return { items, loading };
};
