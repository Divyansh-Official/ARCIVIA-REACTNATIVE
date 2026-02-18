import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAccentColor, getGlowColor, getOverlayGradient } from "../../../theme/gradients";
import { ThemeName, themes } from "@/theme/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 420;

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
}

interface FeaturedCardProps {
  item: HeritageItem;
  theme: ThemeName;
  index: number;
  onPress: (item: HeritageItem) => void;
  onLike: (id: string) => void;
  isLiked: boolean;
  animDelay?: number;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  item,
  theme,
  index,
  onPress,
  onLike,
  isLiked,
  animDelay = 0,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);
  const glow = getGlowColor(theme);
  const overlayColors = getOverlayGradient(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: animDelay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay: animDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        delay: animDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1.4,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onLike(item.id);
  };

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: pressAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { shadowColor: glow }]}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.image}
          imageStyle={styles.imageStyle}
        >
          {/* Top row */}
          <View style={styles.topRow}>
            {item.isAR && (
              <BlurView
                intensity={60}
                tint={theme === "light" ? "light" : "dark"}
                style={styles.arBadge}
              >
                <Ionicons name="cube-outline" size={11} color={accent} />
                <Text style={[styles.arText, { color: accent }]}>AR</Text>
              </BlurView>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
              <BlurView
                intensity={60}
                tint={theme === "light" ? "light" : "dark"}
                style={styles.likeBlur}
              >
                <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={18}
                    color={isLiked ? "#ff4d6d" : "#fff"}
                  />
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Bottom overlay */}
          <LinearGradient
            colors={overlayColors as any}
            style={styles.overlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Era badge */}
            <View
              style={[
                styles.eraBadge,
                { borderColor: accent + "60", backgroundColor: accent + "22" },
              ]}
            >
              <Text style={[styles.eraText, { color: accent }]}>
                {item.era}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>
              {item.culture} · {item.location}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons
                  name="eye-outline"
                  size={13}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.statText}>
                  {(item.views / 1000).toFixed(1)}k
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name="heart-outline"
                  size={13}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <LinearGradient
                colors={[accent, accent + "bb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreBtn}
              >
                <Text style={styles.exploreBtnText}>Explore</Text>
                <Ionicons name="arrow-forward" size={12} color="#fff" />
              </LinearGradient>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  image: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageStyle: {
    borderRadius: 28,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  arBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  arText: {
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 1,
  },
  likeBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  likeBlur: {
    padding: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  overlay: {
    padding: 20,
    paddingTop: 40,
  },
  eraBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  eraText: {
    fontSize: 9,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "SpaceMono-Regular",
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "SpaceMono-Regular",
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
  },
  exploreBtnText: {
    fontSize: 12,
    color: "#ffffff",
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
  },
});

export default FeaturedCard;
