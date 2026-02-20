import { useFetchExplore } from "@/hooks/useFetchExplore";
import { getAccentColor, getExploreGradient } from "@/theme/gradients";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import CategoryTabs from "../components/explore/CategoryTabs";
import ExploreHeader from "../components/explore/ExploreHeader";
import FeaturedCard, { HeritageItem } from "../components/explore/FeaturedCard";
import FilterBottomSheet, {
  FilterState,
} from "../components/explore/FilterBottomSheet";
import GridSection from "../components/explore/GridSection";
import TrendingRow from "../components/explore/TrendingRow";
import { useTheme } from "../context/ThemeContext";
import { router } from "expo-router";

type RootStack = { Explore: undefined; ExploreDetails: { item: HeritageItem } };
type NavProp = NativeStackNavigationProp<RootStack, "Explore">;

// ─── Scroll-section keys ──────────────────────────────────────────────────────
type SectionKey = "featured" | "trending" | "grid" | "spacer";
interface Section {
  key: SectionKey;
  data?: HeritageItem[];
}

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { themeName } = useTheme();
  const grad = getExploreGradient(themeName);
  const accent = getAccentColor(themeName);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterVisible, setFilterVisible] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    era: [],
    culture: [],
    arOnly: false,
    sortBy: "popular",
  });

  // Single Animated.Value shared by Header + parallax — always native driver
  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    items,
    featured,
    trending,
    loading,
    refreshing,
    error,
    fetchNextPage,
    refresh,
  } = useFetchExplore(activeCategory, filters, searchQuery);

const handleItemPress = useCallback((item: HeritageItem) => {
  router.push({
    pathname: "../../Fragments/ExploreDetails",
    params: {
      item: JSON.stringify(item),
    },
  });
}, []);

  const handleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const gridItems = useMemo(
    () => items.filter((i) => !featured.some((f) => f.id === i.id)),
    [items, featured],
  );

  // Build flat section list so we use ONE FlatList → avoids nested scroll jank
  const sections = useMemo<Section[]>(() => {
    const s: Section[] = [];
    if (featured.length) s.push({ key: "featured", data: featured });
    if (trending.length) s.push({ key: "trending", data: trending });
    if (gridItems.length) s.push({ key: "grid", data: gridItems });
    s.push({ key: "spacer" });
    return s;
  }, [featured, trending, gridItems]);

  const renderSection = useCallback(
    ({ item: section }: ListRenderItemInfo<Section>) => {
      switch (section.key) {
        case "featured":
          return (
            <View style={styles.featuredBlock}>
              <View style={styles.sectionHeader}>
                <View style={[styles.dot, { backgroundColor: accent }]} />
                <Text style={[styles.sectionTitle, { color: accent }]}>
                  Featured
                </Text>
              </View>
              {section.data!.map((item, idx) => (
                <FeaturedCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onPress={handleItemPress}
                  onLike={handleLike}
                  isLiked={likedIds.has(item.id)}
                  animDelay={idx * 80}
                />
              ))}
            </View>
          );

        case "trending":
          return (
            <TrendingRow
              items={section.data!}
              onPress={handleItemPress}
              title="Trending Now"
            />
          );

        case "grid":
          return (
            <GridSection
              items={section.data!}
              title="Discover More"
              onPress={handleItemPress}
              onLike={handleLike}
              likedIds={likedIds}
              onSeeAll={() => {}}
            />
          );

        case "spacer":
          return <View style={{ height: 120 }} />;

        default:
          return null;
      }
    },
    [accent, handleItemPress, handleLike, likedIds],
  );

  const ListHeader = useMemo(
    () => (
      <>
        <ExploreHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={() => setFilterVisible(true)}
          scrollY={scrollY}
        />
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </>
    ),
    [searchQuery, activeCategory, scrollY],
  );

  const EmptyComponent = useMemo(
    () =>
      loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={[styles.loadingText, { color: accent + "99" }]}>
            Loading heritage...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: accent }]}>{error}</Text>
        </View>
      ) : null,
    [loading, error, accent],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={grad.colors as any}
        start={grad.start}
        end={grad.end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Glow orbs — non-interactive, no rerender cost */}
      <View
        style={[styles.orb, styles.orb1, { backgroundColor: accent + "16" }]}
        pointerEvents="none"
      />
      {/* <View
        style={[styles.orb, styles.orb2, { backgroundColor: accent + "0b" }]}
        pointerEvents="none"
      /> */}

      <Animated.FlatList
        data={sections}
        keyExtractor={(s) => s.key}
        renderItem={renderSection}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }, // ← true keeps scroll on UI thread
        )}
        scrollEventThrottle={16}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={accent}
            colors={[accent]}
          />
        }
        removeClippedSubviews
        windowSize={5}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={80}
      />

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => setFilterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingTop: 8 },
  featuredBlock: { marginBottom: 24, justifyContent: "center", gap: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: -0.2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 1.5,
  },
  errorText: { fontSize: 13, fontFamily: "SpaceMono-Regular" },
  orb: { position: "absolute", borderRadius: 300 },
  orb1: { width: 200, height: 200, top: -10, right: -60 },
  orb2: { width: 240, height: 240, bottom: 180, left: -70 },
});

export default ExploreScreen;
