import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Theme

// Components
import CategoryTabs from "../components/explore/CategoryTabs";
import ExploreHeader from "../components/explore/ExploreHeader";
import FeaturedCard from "../components/explore/FeaturedCard";
import FilterBottomSheet, {
  FilterState,
} from "../components/explore/FilterBottomSheet";
import GridSection from "../components/explore/GridSection";
import TrendingRow from "../components/explore/TrendingRow";

// Hooks & Data
import { useFetchExplore } from "@/hooks/useFetchExplore";
import { getAccentColor, getExploreGradient } from "@/theme/gradients";
import { ThemeName, themes } from "@/theme/theme";
import { HeritageItem } from "../components/explore/FeaturedCard";

// ─── NAV TYPES (adjust to your nav stack) ────────────────────────────────────
type RootStackParamList = {
  Explore: undefined;
  ExploreDetails: { item: HeritageItem };
};
type NavProp = NativeStackNavigationProp<RootStackParamList, "Explore">;

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface ExploreScreenProps {
  theme?: ThemeName;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const ExploreScreen: React.FC<ExploreScreenProps> = ({ theme = "dark" }) => {
  const navigation = useNavigation<NavProp>();
  const t = themes[theme];
  const grad = getExploreGradient(theme);
  const accent = getAccentColor(theme);

  // State
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

  // Animated scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // Data
  const {
    items,
    featured,
    trending,
    loading,
    refreshing,
    error,
    fetchNextPage,
    refresh,
  } = useFetchExplore(activeCategory, filters);

  // Handlers
  const handleItemPress = useCallback(
    (item: HeritageItem) => {
      navigation.navigate("ExploreDetails", { item });
    },
    [navigation],
  );

  const handleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // TODO: sync to Firebase
    // import { doc, updateDoc, increment } from 'firebase/firestore';
    // await updateDoc(doc(db, 'heritage_items', id), { likes: increment(isLiked ? -1 : 1) });
  }, []);

  const handleApplyFilters = () => setFilterVisible(false);

  // Filter items by search
  const displayItems = searchQuery
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.culture.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.era.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : items;

  const gridItems = displayItems.filter(
    (i) => !featured.some((f) => f.id === i.id),
  );

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={grad.colors as any}
        start={grad.start}
        end={grad.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Futuristic glow orbs */}
      <View
        style={[
          styles.glowOrb,
          styles.glowOrb1,
          { backgroundColor: accent + "18" },
        ]}
      />
      <View
        style={[
          styles.glowOrb,
          styles.glowOrb2,
          { backgroundColor: accent + "0d" },
        ]}
      />

      {/* Sticky Header */}
      <ExploreHeader
        theme={theme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setFilterVisible(true)}
        scrollY={scrollY}
      />

      {/* Category Tabs */}
      <CategoryTabs
        theme={theme}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={accent}
            colors={[accent]}
          />
        }
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
      >
        {loading && items.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={[styles.loadingText, { color: t.text02 }]}>
              Loading heritage...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.loadingState}>
            <Text style={[styles.errorText, { color: accent }]}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Featured cards */}
            {featured.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[styles.sectionDot, { backgroundColor: accent }]}
                  />
                  <Text style={[styles.sectionTitle, { color: t.text01 }]}>
                    Featured
                  </Text>
                </View>
                {featured.map((item, idx) => (
                  <FeaturedCard
                    key={item.id}
                    item={item}
                    theme={theme}
                    index={idx}
                    onPress={handleItemPress}
                    onLike={handleLike}
                    isLiked={likedIds.has(item.id)}
                    animDelay={idx * 100}
                  />
                ))}
              </View>
            )}

            {/* Trending row */}
            {trending.length > 0 && (
              <TrendingRow
                items={trending}
                theme={theme}
                onPress={handleItemPress}
                title="Trending Now"
              />
            )}

            {/* Grid */}
            {gridItems.length > 0 && (
              <GridSection
                items={gridItems}
                theme={theme}
                title="Discover More"
                onPress={handleItemPress}
                onLike={handleLike}
                likedIds={likedIds}
                onSeeAll={() => {}}
              />
            )}

            {/* Bottom spacer */}
            <View style={{ height: 100 }} />
          </>
        )}
      </Animated.ScrollView>

      {/* Filter sheet */}
      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        theme={theme}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 300,
  },
  glowOrb1: {
    width: 300,
    height: 300,
    top: -80,
    right: -80,
  },
  glowOrb2: {
    width: 220,
    height: 220,
    bottom: 200,
    left: -60,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: -0.2,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "SpaceMono-Regular",
  },
});

export default ExploreScreen;
