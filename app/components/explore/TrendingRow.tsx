import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useRef } from "react";
import {
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAccentColor, getGlowColor } from "@/theme/gradients";
import { useTheme } from "@/app/context/ThemeContext";
import { HeritageItem } from "./FeaturedCard";

const CARD_W = 160;
const CARD_H = 220;
const NUMBER_W = 80;   // width of the large rank number
const OVERLAP  = 36;   // how much the card overlaps the number
const ITEM_W   = NUMBER_W + CARD_W - OVERLAP; // total item width in scroll

interface TrendingRowProps {
  items:   HeritageItem[];
  onPress: (item: HeritageItem) => void;
  title?:  string;
}

const TrendingCard = memo(({
  item, index, onPress,
}: {
  item:    HeritageItem;
  index:   number;
  onPress: (item: HeritageItem) => void;
}) => {
  const { themeName } = useTheme();
  const accent = getAccentColor(themeName);
  const glow   = getGlowColor(themeName);
  const scale  = useRef(new Animated.Value(1)).current;

  const handlePress  = useCallback(() => onPress(item), [item, onPress]);
  const handleIn     = useCallback(() =>
    Animated.spring(scale, { toValue: 0.94, friction: 8, useNativeDriver: true }).start(), []);
  const handleOut    = useCallback(() =>
    Animated.spring(scale, { toValue: 1,    friction: 6, useNativeDriver: true }).start(), []);

  const rankStr = String(index + 1);

  return (
    <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
      {/* ── Large Netflix-style rank number (outlined stroke via layered Text) ── */}
      <View style={styles.numberContainer}>
        {/* Stroke layers: render number multiple times offset in 8 directions */}
        {[
          [-2, -2], [0, -2], [2, -2],
          [-2,  0],          [2,  0],
          [-2,  2], [0,  2], [2,  2],
        ].map(([dx, dy], i) => (
          <Text
            key={i}
            style={[styles.rankNumberStroke, { position: "absolute", bottom: 0, left: dx, marginBottom: dy }]}
            numberOfLines={1}
          >
            {rankStr}
          </Text>
        ))}
        {/* Fill layer — transparent center gives hollow/outlined look */}
        <Text style={styles.rankNumberFill} numberOfLines={1}>{rankStr}</Text>
      </View>

      {/* ── Card (overlaps the number on the left) ── */}
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        activeOpacity={1}
        style={[styles.card, { shadowColor: glow }]}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.84)"]} style={styles.overlay}>
            {item.isAR && (
              <View style={[styles.arBadge, { borderColor: accent + "80" }]}>
                <Text style={[styles.arText, { color: accent }]}>AR</Text>
              </View>
            )}
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardEra}>{item.era}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
});

const TrendingRow: React.FC<TrendingRowProps> = memo(({ items, onPress, title = "Trending Now" }) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);

  const handlePress = useCallback((item: HeritageItem) => onPress(item), [onPress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={[styles.title, { color: theme.text01 }]}>{title}</Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.seeAll, { color: accent }]}>See All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={ITEM_W + 4}
        snapToAlignment="start"
      >
        {items.map((item, idx) => (
          <TrendingCard key={item.id} item={item} index={idx} onPress={handlePress} />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container:     { marginBottom: 24 },
  header:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  headerLeft:    { flexDirection: "row", alignItems: "center", gap: 8 },
  dot:           { width: 6, height: 6, borderRadius: 3 },
  title:         { fontSize: 16, fontFamily: "PlayfairDisplay-Bold", letterSpacing: -0.2 },
  seeAll:        { fontSize: 11, fontFamily: "SpaceMono-Regular", letterSpacing: 0.5 },
  scrollContent: { paddingLeft: 20, paddingRight: 8 },

  /* Each row item: number behind, card on top-right */
  itemContainer: {
    width: ITEM_W,
    height: CARD_H,
    flexDirection: "row",
    alignItems: "flex-end",   // align to card bottom so number sits at base
    marginRight: 4,
  },

  /* Large rank number container */
  numberContainer: {
    width: NUMBER_W,
    height: CARD_H,
    justifyContent: "flex-end",    // pin number to bottom like Netflix
    alignItems: "flex-start",
    paddingBottom: 0,
    zIndex: 0,
  },
  /* Stroke copies — slightly visible outline color */
  rankNumberStroke: {
    fontSize: 140,
    lineHeight: 140,
    fontFamily: "PlayfairDisplay-Bold",
    color: "rgba(255,255,255,0.22)",    // outline color
    includeFontPadding: false,
  },
  /* Top fill layer — dark/transparent so outline shows through edges */
  rankNumberFill: {
    fontSize: 140,
    lineHeight: 140,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#111",                       // matches dark bg — creates "hollow" look
    includeFontPadding: false,
  },

  /* Card sits to the right, overlapping number */
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: -OVERLAP,   // negative margin pulls card left over the number
    zIndex: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    elevation: 8,
  },
  cardImage:     { flex: 1, justifyContent: "flex-end" },
  cardImageStyle:{ borderRadius: 20 },
  overlay:       { padding: 12, paddingTop: 28 },
  arBadge:       { alignSelf: "flex-start", borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
  arText:        { fontSize: 8, fontFamily: "SpaceMono-Regular", letterSpacing: 1.5 },
  cardTitle:     { fontSize: 12, fontFamily: "PlayfairDisplay-Bold", color: "#fff", lineHeight: 16, marginBottom: 3 },
  cardEra:       { fontSize: 9, fontFamily: "SpaceMono-Regular", color: "rgba(255,255,255,0.55)", letterSpacing: 1 },
});

TrendingCard.displayName = "TrendingCard";
TrendingRow.displayName  = "TrendingRow";
export default TrendingRow;