import { HeritageItem } from "@/app/components/explore/FeaturedCard";
import { useCallback, useEffect, useState } from "react";

// ─── ENV CONFIG ───────────────────────────────────────────────────────────────
// In your .env file (with expo-constants or react-native-config):
// EXPO_PUBLIC_HERITAGE_API_URL=https://...
// EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
// etc.
//
// Recommended APIs:
// 1. Europeana API (https://apis.europeana.eu) — 50M+ cultural heritage items, FREE
//    → Best for artifacts, paintings, monuments across European institutions
// 2. The Metropolitan Museum API (https://metmuseum.github.io) — FREE, no key required
//    → 490k+ objects from The Met
// 3. Harvard Art Museums API (https://api.harvardartmuseums.org) — FREE key
//    → High-res images, detailed provenance data
// 4. Smithsonian Open Access API (https://edan.si.edu/openaccess/apidocs/) — FREE
//    → 11M+ records from Smithsonian institutions
// 5. Google Arts & Culture Partner API — Application required
//
// For AR overlays:
// - 8th Wall (https://www.8thwall.com) — WebAR
// - Niantic Lightship (https://lightship.dev) — native AR SDK

const HERITAGE_API_URL = process.env.EXPO_PUBLIC_HERITAGE_API_URL ?? "";
const MET_API = "https://collectionapi.metmuseum.org/public/collection/v1";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface UseFetchExploreReturn {
  items: HeritageItem[];
  featured: HeritageItem[];
  trending: HeritageItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  fetchNextPage: () => void;
  refresh: () => void;
}

// ─── MOCK DATA (swap with real API calls) ────────────────────────────────────
export const MOCK_ITEMS: HeritageItem[] = [
  {
    id: "1",
    title: "Mask of Tutankhamun",
    subtitle: "18th Dynasty Royal Funerary Mask",
    era: "Ancient Egypt · 1323 BC",
    culture: "Egyptian",
    imageUrl: "https://images.metmuseum.org/CRDImages/eg/original/DP251139.jpg",
    views: 124000,
    likes: 8420,
    isAR: true,
    category: "artifacts",
    location: "Cairo, Egypt",
    description:
      "The death mask of Tutankhamun is a gold mask of the mummy of the 18th-dynasty Ancient Egyptian Pharaoh Tutankhamun. It is one of the most famous works of art in the world.",
    tags: ["gold", "funerary", "royal", "18th dynasty"],
  },
  {
    id: "2",
    title: "Colosseum",
    subtitle: "Flavian Amphitheatre",
    era: "Roman Empire · 70–80 AD",
    culture: "Roman",
    imageUrl: "https://images.metmuseum.org/CRDImages/gr/original/DP132633.jpg",
    views: 892000,
    likes: 32100,
    isAR: true,
    category: "monuments",
    location: "Rome, Italy",
    description:
      "The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy. Built of travertine limestone, volcanic tuff, and brick-faced concrete.",
    tags: ["amphitheatre", "roman", "gladiatorial", "architecture"],
  },
  {
    id: "3",
    title: "Venus de Milo",
    subtitle: "Ancient Greek Sculpture",
    era: "Hellenistic · 130–100 BC",
    culture: "Greek",
    imageUrl: "https://images.metmuseum.org/CRDImages/gr/original/DP121212.jpg",
    views: 234000,
    likes: 14200,
    isAR: false,
    category: "artifacts",
    location: "Louvre, Paris",
    description:
      "The Venus de Milo is an ancient Greek sculpture and one of the most famous works of ancient Greek sculpture. Created sometime between 130 and 100 BC.",
    tags: ["sculpture", "marble", "goddess", "hellenistic"],
  },
  {
    id: "4",
    title: "Stonehenge",
    subtitle: "Neolithic Monument",
    era: "Prehistoric · 3000 BC",
    culture: "Celtic",
    imageUrl: "https://images.metmuseum.org/CRDImages/gr/original/DP114888.jpg",
    views: 675000,
    likes: 28900,
    isAR: true,
    category: "monuments",
    location: "Wiltshire, UK",
    description:
      "Stonehenge is a prehistoric monument on Salisbury Plain in Wiltshire, England. Its main phase of construction took place between 3000 and 1500 BC.",
    tags: ["megalith", "prehistoric", "ritual", "astronomy"],
  },
  {
    id: "5",
    title: "Cuneiform Tablet",
    subtitle: "Epic of Gilgamesh Fragment",
    era: "Mesopotamian · 2100 BC",
    culture: "Mesopotamian",
    imageUrl: "https://images.metmuseum.org/CRDImages/an/original/DP251139.jpg",
    views: 87000,
    likes: 5600,
    isAR: false,
    category: "artifacts",
    location: "British Museum, London",
    description:
      "One of the earliest forms of written literature, this clay tablet contains fragments of the Epic of Gilgamesh, humanity's oldest known work of literary fiction.",
    tags: ["writing", "literature", "clay", "sumerian"],
  },
  {
    id: "6",
    title: "Notre-Dame Cathedral",
    subtitle: "French Gothic Architecture",
    era: "Medieval · 1163 AD",
    culture: "French",
    imageUrl: "https://images.metmuseum.org/CRDImages/md/original/DP251139.jpg",
    views: 1200000,
    likes: 47300,
    isAR: true,
    category: "monuments",
    location: "Paris, France",
    description:
      "Notre-Dame de Paris is a medieval Catholic cathedral on the Île de la Cité in the 4th arrondissement of Paris. The cathedral is considered to be one of the finest examples of French Gothic architecture.",
    tags: ["gothic", "cathedral", "medieval", "paris"],
  },
  {
    id: "7",
    title: "Terracotta Army",
    subtitle: "Mausoleum of Qin Shi Huang",
    era: "Qin Dynasty · 210 BC",
    culture: "Chinese",
    imageUrl: "https://images.metmuseum.org/CRDImages/as/original/DP251139.jpg",
    views: 445000,
    likes: 19800,
    isAR: true,
    category: "artifacts",
    location: "Xi'an, China",
    description:
      "The Terracotta Army is a collection of terracotta sculptures depicting the armies of Qin Shi Huang, the first emperor of China. The figures date to the late third century BCE.",
    tags: ["terracotta", "military", "imperial", "burial"],
  },
  {
    id: "8",
    title: "Acropolis of Athens",
    subtitle: "Sacred Rock of Athens",
    era: "Classical · 5th century BC",
    culture: "Greek",
    imageUrl: "https://images.metmuseum.org/CRDImages/gr/original/DP114889.jpg",
    views: 788000,
    likes: 36500,
    isAR: false,
    category: "monuments",
    location: "Athens, Greece",
    description:
      "The Acropolis of Athens is an ancient citadel located on a rocky outcrop above the city of Athens, containing the remains of several ancient buildings of great architectural and historical significance.",
    tags: ["parthenon", "classical", "greek", "acropolis"],
  },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────

/**
 * Primary hook to fetch explore items.
 * Swap mock data for real API calls using the pattern shown below.
 */
export const useFetchExplore = (
  category: string,
  filters: {
    era: string[];
    culture: string[];
    arOnly: boolean;
    sortBy: string;
  },
): UseFetchExploreReturn => {
  const [items, setItems] = useState<HeritageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (page === 1) setLoading(true);

        // ── REAL API EXAMPLE (Europeana) ──────────────────────────────────
        // const apiKey = process.env.EXPO_PUBLIC_EUROPEANA_API_KEY;
        // const res = await fetch(
        //   `https://api.europeana.eu/record/v2/search.json?wskey=${apiKey}&query=${category}&rows=20&start=${(page-1)*20+1}&media=true&thumbnail=true`
        // );
        // const data = await res.json();
        // const mapped: HeritageItem[] = data.items.map((item: any) => ({
        //   id: item.id,
        //   title: item.title?.[0] ?? "Untitled",
        //   subtitle: item.dcDescription?.[0] ?? "",
        //   era: item.year?.join(", ") ?? "Unknown",
        //   culture: item.country?.[0] ?? "Unknown",
        //   imageUrl: item.edmPreview?.[0] ?? "",
        //   views: Math.floor(Math.random() * 100000),
        //   likes: Math.floor(Math.random() * 5000),
        //   isAR: false,
        //   category,
        //   location: item.country?.[0] ?? "",
        //   description: item.dcDescription?.[0] ?? "",
        //   tags: item.dcSubject ?? [],
        // }));

        // ── MOCK (replace above) ──────────────────────────────────────────
        await new Promise((r) => setTimeout(r, 800)); // simulate network
        let filtered = MOCK_ITEMS;

        if (category !== "all" && category !== "trending") {
          filtered = filtered.filter((i) => i.category === category);
        }
        if (filters.arOnly) {
          filtered = filtered.filter((i) => i.isAR);
        }
        if (filters.era.length > 0) {
          filtered = filtered.filter((i) =>
            filters.era.some((e) =>
              i.era.toLowerCase().includes(e.toLowerCase()),
            ),
          );
        }
        if (filters.culture.length > 0) {
          filtered = filtered.filter((i) =>
            filters.culture.some((c) =>
              i.culture.toLowerCase().includes(c.toLowerCase()),
            ),
          );
        }

        if (isRefresh) {
          setItems(filtered);
          setPage(1);
        } else {
          setItems((prev) => (page === 1 ? filtered : [...prev, ...filtered]));
        }
        setHasMore(filtered.length >= 20);
        setError(null);
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, filters, page],
  );

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [category, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    featured: items.slice(0, 3),
    trending: items.slice(0, 6),
    loading,
    refreshing,
    error,
    hasMore,
    fetchNextPage: () => {
      if (hasMore && !loading) setPage((p) => p + 1);
    },
    refresh: () => fetchData(true),
  };
};

/**
 * Hook to fetch a single item's full detail.
 * Use this in ExploreDetails.tsx
 */
export const useFetchItemDetail = (
  id: string,
): {
  item: HeritageItem | null;
  loading: boolean;
  relatedItems: HeritageItem[];
} => {
  const [item, setItem] = useState<HeritageItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      const found = MOCK_ITEMS.find((i) => i.id === id) ?? null;
      setItem(found);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const relatedItems = MOCK_ITEMS.filter(
    (i) =>
      i.id !== id &&
      (i.culture === item?.culture || i.category === item?.category),
  ).slice(0, 4);

  return { item, loading, relatedItems };
};
