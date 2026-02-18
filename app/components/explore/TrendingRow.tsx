import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAccentColor, getGlowColor } from "../../../theme/gradients";
import { ThemeName, themes } from "@/theme/theme";
import { HeritageItem } from "./FeaturedCard";

const { width } = Dimensions.get("window");
const TRENDING_CARD_W = 160;
const TRENDING_CARD_H = 220;

interface TrendingRowProps {
  items: HeritageItem[];
  theme: ThemeName;
  onPress: (item: HeritageItem) => void;
  title?: string;
}

const TrendingCard = ({
  item,
  theme,
  index,
  onPress,
}: {
  item: HeritageItem;
  theme: ThemeName;
  index: number;
  onPress: (item: HeritageItem) => void;
}) => {
  const accent = getAccentColor(theme);
  const glow = getGlowColor(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], marginRight: 12 }}
    >
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.trendingCard, { shadowColor: glow }]}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.trendingImage}
          imageStyle={styles.trendingImageStyle}
        >
          {/* Rank */}
          <View style={styles.rankBadge}>
            <LinearGradient
              colors={[accent, accent + "99"]}
              style={styles.rankGrad}
            >
              <Text style={styles.rankText}>#{index + 1}</Text>
            </LinearGradient>
          </View>
          {/* Bottom */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.82)"]}
            style={styles.trendingOverlay}
          >
            {item.isAR && (
              <View style={[styles.arMini, { borderColor: accent + "80" }]}>
                <Text style={[styles.arMiniText, { color: accent }]}>AR</Text>
              </View>
            )}
            <Text style={styles.trendingTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.trendingEra}>{item.era}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TrendingRow: React.FC<TrendingRowProps> = ({
  items,
  theme,
  onPress,
  title = "Trending Now",
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={[styles.title, { color: t.text01 }]}>{title}</Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: accent }]}>See All →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item, idx) => (
          <TrendingCard
            key={item.id}
            item={item}
            theme={theme}
            index={idx}
            onPress={onPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
  },
  scroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  trendingCard: {
    width: TRENDING_CARD_W,
    height: TRENDING_CARD_H,
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  trendingImage: {
    flex: 1,
    justifyContent: "space-between",
  },
  trendingImageStyle: {
    borderRadius: 20,
  },
  rankBadge: {
    margin: 10,
    alignSelf: "flex-start",
    borderRadius: 10,
    overflow: "hidden",
  },
  rankGrad: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    color: "#fff",
    letterSpacing: 0.5,
  },
  trendingOverlay: {
    padding: 12,
    paddingTop: 30,
  },
  arMini: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  arMiniText: {
    fontSize: 8,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 1.5,
  },
  trendingTitle: {
    fontSize: 12,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#ffffff",
    lineHeight: 16,
    marginBottom: 3,
  },
  trendingEra: {
    fontSize: 9,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
  },
});

export default TrendingRow;
