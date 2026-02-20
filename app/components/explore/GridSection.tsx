import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAccentColor, getGlowColor, getOverlayGradient } from "@/theme/gradients";
import { useTheme } from "@/app/context/ThemeContext";
import { HeritageItem } from "./FeaturedCard";

const { width } = Dimensions.get("window");
const H_PAD  = 16;
const GAP    = 12;
const CARD_W = Math.floor((width - H_PAD * 2 - GAP) / 2);
const CARD_H = Math.round(CARD_W * 1.42);

// ─── GridCard ─────────────────────────────────────────────────────────────────

interface GridCardProps {
  item:    HeritageItem;
  index:   number;
  onPress: (item: HeritageItem) => void;
  onLike:  (id: string) => void;
  isLiked: boolean;
}

const GridCard: React.FC<GridCardProps> = memo(({ item, index, onPress, onLike, isLiked }) => {
  const { themeName } = useTheme();
  const accent        = getAccentColor(themeName);
  const glow          = getGlowColor(themeName);
  const overlayColors = getOverlayGradient(themeName);

  // ── entrance animations ──
  const opacity    = useRef(new Animated.Value(0)).current;
  const slideY     = useRef(new Animated.Value(60)).current;
  const rotateAnim = useRef(new Animated.Value(index % 2 === 0 ? -6 : 6)).current;

  // ── interaction animations ──
  const scale    = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const heart    = useRef(new Animated.Value(1)).current;

  // ── shimmer animation ──
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const delay = index * 80;

    // Entrance: slide + fade + un-rotate
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideY,     { toValue: 0, friction: 7, tension: 40, delay, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, friction: 6, tension: 30, delay: delay + 80, useNativeDriver: true }),
    ]).start();

    // Shimmer loop after entrance
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, delay: delay + 600, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
        Animated.delay(3000 + index * 400),
      ])
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.spring(heart, { toValue: 1.4, friction: 2, useNativeDriver: true }),
      Animated.spring(heart, { toValue: 0.85, friction: 4, useNativeDriver: true }),
      Animated.spring(heart, { toValue: 1.1, friction: 5, useNativeDriver: true }),
      Animated.spring(heart, { toValue: 1,   friction: 5, useNativeDriver: true }),
    ]).start();
    onLike(item.id);
  }, [item.id, onLike]);

  const handleIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale,    { toValue: 0.93, friction: 7, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale,    { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate    = rotateAnim.interpolate({ inputRange: [-6, 6], outputRange: ["-6deg", "6deg"] });
  const shimmerX  = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-CARD_W, CARD_W * 1.5] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity,
          transform: [{ translateY: slideY }, { rotate }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        style={[styles.card, { shadowColor: glow, width: CARD_W, height: CARD_H }]}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          {/* ── Shimmer sweep ── */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmerStrip,
              { transform: [{ translateX: shimmerX }] },
            ]}
          />

          {/* ── Glow border on press ── */}
          <Animated.View
            pointerEvents="none"
            style={[styles.glowBorder, { borderColor: accent, opacity: glowOpacity }]}
          />

          {/* ── Top badges + Heart ── */}
          <View style={styles.topRow}>
            {item.isAR && (
              <LinearGradient
                colors={[accent, accent + "99"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.arPill}
              >
                <Ionicons name="cube-outline" size={9} color="#fff" />
                <Text style={styles.arLabel}>AR</Text>
              </LinearGradient>
            )}

            {/* Spacer pushes heart to far right */}
            <View style={{ flex: 1 }} />

            {/* Heart button — clipped container prevents animation overflow */}
            <View style={styles.heartClip}>
              <TouchableOpacity
                onPress={handleLike}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Animated.View style={{ transform: [{ scale: heart }] }}>
                  <LinearGradient
                    colors={isLiked ? ["#ff4d6d", "#c9184a"] : ["rgba(255,255,255,0.18)", "rgba(255,255,255,0.08)"]}
                    style={styles.heartGradient}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={13}
                      color="#fff"
                    />
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Bottom overlay ── */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.92)"]}
            style={styles.cardOverlay}
          >
            {/* Decorative accent line */}
            <View style={[styles.accentLine, { backgroundColor: accent }]} />

            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

            <View style={styles.cardBottom}>
              <View style={styles.eraChip}>
                <Text style={styles.eraLabel}>{item.era}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── GridSection ──────────────────────────────────────────────────────────────

interface GridSectionProps {
  items:    HeritageItem[];
  title:    string;
  onPress:  (item: HeritageItem) => void;
  onLike:   (id: string) => void;
  likedIds: Set<string>;
  onSeeAll?: () => void;
}

const GridSection: React.FC<GridSectionProps> = memo(({
  items, title, onPress, onLike, likedIds, onSeeAll,
}) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);

  // Header entrance
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerX       = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(headerX,       { toValue: 0, friction: 7,   useNativeDriver: true }),
    ]).start();
  }, []);

  const renderItem = useCallback(({ item, index }: { item: HeritageItem; index: number }) => (
    <GridCard
      item={item}
      index={index}
      onPress={onPress}
      onLike={onLike}
      isLiked={likedIds.has(item.id)}
    />
  ), [onPress, onLike, likedIds]);

  const keyExtractor = useCallback((item: HeritageItem) => item.id, []);

  return (
    <View style={styles.section}>
      {/* ── Section header ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, transform: [{ translateX: headerX }] },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.titleDecor}>
            <View style={[styles.titleBar,   { backgroundColor: accent }]} />
            <View style={[styles.titleBarSm, { backgroundColor: accent + "55" }]} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text01 }]}>{title}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.seeAll, { color: accent }]}>See All →</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ── Grid ── */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
        removeClippedSubviews
        windowSize={3}
        maxToRenderPerBatch={4}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  section: { marginBottom: 8 },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: H_PAD,
    marginBottom: 16,
  },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: 10 },
  titleDecor:   { gap: 3 },
  titleBar:     { width: 3, height: 14, borderRadius: 2 },
  titleBarSm:   { width: 3, height: 6,  borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontFamily: "PlayfairDisplay-Bold", letterSpacing: -0.2 },
  seeAll:       { fontSize: 11, fontFamily: "SpaceMono-Regular",    letterSpacing: 0.5 },

  // ── Grid ──
  grid: {
    paddingHorizontal: H_PAD,
    alignItems: "center",  // ← centres the two-column layout horizontally
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
    justifyContent: "center",   // ← centres columns & handles odd-item rows
    width: "100%",
  },

  // ── Card ──
  cardWrapper: {
    width: CARD_W,
    // No extra margin; gap/justifyContent handle spacing
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  cardImage:      { flex: 1, justifyContent: "space-between" },
  cardImageStyle: { borderRadius: 22 },

  // Shimmer sweep
  shimmerStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ skewX: "-20deg" }],
  },

  // Press glow border
  glowBorder: {
    position: "absolute",
    inset: 0,            // top/right/bottom/left: 0
    borderRadius: 22,
    borderWidth: 1.5,
  },

  // Top badges
  topRow: {
    flexDirection: "row",
    padding: 10,
    gap: 6,
    alignItems: "flex-start",
  },
  arPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  arLabel: {
    fontSize: 8,
    fontFamily: "SpaceMono-Regular",
    color: "#fff",
    letterSpacing: 1,
  },

  // Bottom overlay
  cardOverlay:  { padding: 12, paddingTop: 40, gap: 6 },
  accentLine:   { width: 20, height: 2, borderRadius: 1, marginBottom: 2 },
  cardTitle:    {
    fontSize: 13,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#fff",
    lineHeight: 17,
  },
  cardBottom:   {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  eraChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eraLabel: {
    fontSize: 8,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  // Heart clip — prevents scale animation from overflowing card edges
  heartClip: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 11,
  },
  heartGradient: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

GridCard.displayName    = "GridCard";
GridSection.displayName = "GridSection";
export { GridCard };
export default GridSection;