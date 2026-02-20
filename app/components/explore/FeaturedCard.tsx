import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GlassView from "@/app/components/UI/GlassView";
import { getAccentColor, getGlowColor, getOverlayGradient } from "@/theme/gradients";
import { useTheme } from "@/app/context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_W = width - 40;
const CARD_H = 440;

export interface HeritageItem {
  id:          string;
  title:       string;
  subtitle:    string;
  era:         string;
  culture:     string;
  imageUrl:    string;
  views:       number;
  likes:       number;
  isAR:        boolean;
  category:    string;
  location:    string;
  description: string;
  tags:        string[];
}

interface FeaturedCardProps {
  item:       HeritageItem;
  index:      number;
  onPress:    (item: HeritageItem) => void;
  onLike:     (id: string) => void;
  isLiked:    boolean;
  animDelay?: number;
}

const FeaturedCard: React.FC<FeaturedCardProps> = memo(({
  item, index, onPress, onLike, isLiked, animDelay = 0,
}) => {
  const { themeName } = useTheme();
  const accent        = getAccentColor(themeName);
  const glow          = getGlowColor(themeName);
  const overlayColors = getOverlayGradient(themeName);

  // ── Entrance ──
  const opacity    = useRef(new Animated.Value(0)).current;
  const slideY     = useRef(new Animated.Value(70)).current;
  const cardScale  = useRef(new Animated.Value(0.88)).current;

  // ── Press ──
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressGlow  = useRef(new Animated.Value(0)).current;

  // ── Heart ──
  const heart      = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;

  // ── Shimmer ──
  const shimmer    = useRef(new Animated.Value(-1)).current;

  // ── Floating particles (3 dots) ──
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;

  // ── Gradient pan (slow slide) ──
  const gradientShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 600, delay: animDelay,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0, friction: 8, tension: 50, delay: animDelay, useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1, friction: 7, tension: 45, delay: animDelay + 60, useNativeDriver: true,
      }),
    ]).start();

    // Shimmer loop
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(animDelay + 800 + index * 500),
        Animated.timing(shimmer, {
          toValue: 1, duration: 1600,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
        Animated.delay(4000 + index * 700),
      ])
    );
    shimmerLoop.start();

    // Floating particle loops
    const makeFloat = (anim: Animated.Value, dur: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );

    makeFloat(p1, 2800, animDelay + 200).start();
    makeFloat(p2, 3400, animDelay + 700).start();
    makeFloat(p3, 2400, animDelay + 400).start();

    return () => {
      shimmerLoop.stop();
    };
  }, []);

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  const handleLike = useCallback(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(heart, { toValue: 2.0, friction: 2, useNativeDriver: true }),
        Animated.timing(heartOpacity, { toValue: 0.6, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(heart, { toValue: 0.85, friction: 4, useNativeDriver: true }),
        Animated.timing(heartOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.spring(heart, { toValue: 1.1, friction: 5, useNativeDriver: true }),
      Animated.spring(heart, { toValue: 1,   friction: 5, useNativeDriver: true }),
    ]).start();
    onLike(item.id);
  }, [item.id, onLike]);

  const handleIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, { toValue: 0.965, friction: 7, useNativeDriver: true }),
      Animated.timing(pressGlow,  { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(pressGlow,  { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  // Interpolations
  const shimmerX   = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-CARD_W * 0.5, CARD_W * 1.5] });
  const glowBorder = pressGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const p1Y = p1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const p2Y = p2.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const p3Y = p3.interpolate({ inputRange: [0, 1], outputRange: [0,  -8] });
  const p1O = p1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.9, 0.4] });
  const p2O = p2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] });
  const p3O = p3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.6, 0.2] });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY: slideY }, { scale: cardScale }],
        },
      ]}
    >
      {/* ── Floating glow particles ── */}
      <Animated.View style={[styles.particle, styles.particle1, { opacity: p1O, transform: [{ translateY: p1Y }], backgroundColor: accent + "66" }]} />
      <Animated.View style={[styles.particle, styles.particle2, { opacity: p2O, transform: [{ translateY: p2Y }], backgroundColor: accent + "44" }]} />
      <Animated.View style={[styles.particle, styles.particle3, { opacity: p3O, transform: [{ translateY: p3Y }], backgroundColor: accent + "55" }]} />

      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        {/* ── Press glow border ── */}
        <Animated.View
          pointerEvents="none"
          style={[styles.glowBorder, { borderColor: accent, opacity: glowBorder, shadowColor: accent }]}
        />

        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          onPressIn={handleIn}
          onPressOut={handleOut}
          style={[styles.card, { shadowColor: glow }]}
        >
          <ImageBackground
            source={{ uri: item.imageUrl }}
            style={styles.image}
            imageStyle={styles.imageBorderRadius}
          >
            {/* ── Shimmer sweep ── */}
            <Animated.View
              pointerEvents="none"
              style={[styles.shimmerStrip, { transform: [{ translateX: shimmerX }, { skewX: "-18deg" }] }]}
            />

            {/* ── Top row ── */}
            <View style={styles.topRow}>
              {item.isAR && (
                <GlassView intensity={60} style={styles.arBadge}>
                  <Ionicons name="cube-outline" size={11} color={accent} />
                  <Text style={[styles.arText, { color: accent }]}>AR</Text>
                </GlassView>
              )}
              <View style={{ flex: 1 }} />

              {/* Like button */}
              <TouchableOpacity onPress={handleLike} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <GlassView intensity={60} style={styles.likeBtn}>
                  <Animated.View style={{ transform: [{ scale: heart }], opacity: heartOpacity }}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#ff4d6d" : "#fff"}
                    />
                  </Animated.View>
                  {isLiked && (
                    <LinearGradient
                      colors={["#ff4d6d22", "#c9184a11"]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                </GlassView>
              </TouchableOpacity>
            </View>

            {/* ── Bottom overlay ── */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.30)", "rgba(0,0,0,0.85)", "rgba(0,0,0,0.97)"]}
              style={styles.overlay}
            >
              {/* Era + category pill row */}
              <View style={styles.pillRow}>
                <View style={[styles.eraPill, { borderColor: accent + "70", backgroundColor: accent + "20" }]}>
                  <View style={[styles.eraDot, { backgroundColor: accent }]} />
                  <Text style={[styles.eraText, { color: accent }]}>{item.era}</Text>
                </View>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>

              {/* Title with decorative left bar */}
              <View style={styles.titleRow}>
                <View style={[styles.titleAccentBar, { backgroundColor: accent }]} />
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              </View>

              {/* Culture · Location */}
              <Text style={styles.cardSub}>{item.culture} · {item.location}</Text>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.10)" }]} />

              {/* Stats + CTA */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.statText}>{(item.views / 1000).toFixed(1)}k</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="heart-outline" size={12} color="rgba(255,255,255,0.55)" />
                  <Text style={styles.statText}>{item.likes}</Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Explore CTA */}
                <LinearGradient
                  colors={[accent, accent + "cc"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exploreBtn}
                >
                  <Text style={styles.exploreBtnText}>Explore</Text>
                  <Ionicons name="arrow-forward" size={11} color="#fff" />
                </LinearGradient>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // ── Floating particles ──
  particle: {
    position: "absolute",
    borderRadius: 99,
    zIndex: 0,
  },
  particle1: { width: 10, height: 10, top: 20,  left: "20%" },
  particle2: { width: 7,  height: 7,  top: 50,  right: "25%" },
  particle3: { width: 5,  height: 5,  top: 35,  left: "55%" },

  // ── Glow border overlay ──
  glowBorder: {
    position: "absolute",
    inset: 0,
    borderRadius: 30,
    borderWidth: 1.5,
    zIndex: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  // ── Card ──
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 30,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 14,
  },
  image:             { flex: 1, justifyContent: "space-between" },
  imageBorderRadius: { borderRadius: 30 },

  // ── Shimmer ──
  shimmerStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "rgba(255,255,255,0.09)",
    zIndex: 2,
  },

  // ── Top row ──
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  arBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
  },
  arText: { fontSize: 10, fontFamily: "SpaceMono-Regular", letterSpacing: 1.2 },
  likeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // ── Overlay ──
  overlay: { padding: 20, paddingTop: 50, gap: 0 },

  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  eraPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  eraDot:  { width: 5, height: 5, borderRadius: 3 },
  eraText: { fontSize: 9, fontFamily: "SpaceMono-Regular", letterSpacing: 2, textTransform: "uppercase" },

  categoryPill: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 9,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 6,
  },
  titleAccentBar: {
    width: 3,
    height: "100%",
    borderRadius: 2,
    minHeight: 28,
    marginTop: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 26,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#fff",
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  cardSub: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.4,
    marginBottom: 14,
    marginLeft: 13,  // align with title (past accent bar)
  },

  divider: { height: 1, marginBottom: 14 },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.55)",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  exploreBtnText: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
    color: "#fff",
    letterSpacing: 0.6,
  },
});

FeaturedCard.displayName = "FeaturedCard";
export default FeaturedCard;