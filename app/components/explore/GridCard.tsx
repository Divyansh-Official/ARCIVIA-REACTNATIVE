import { Ionicons } from "@expo/vector-icons";
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
import { HeritageItem } from "./FeaturedCard";

const { width } = Dimensions.get("window");
const GRID_CARD_WIDTH = (width - 52) / 2;

interface GridCardProps {
  item: HeritageItem;
  theme: ThemeName;
  index: number;
  onPress: (item: HeritageItem) => void;
  onLike: (id: string) => void;
  isLiked: boolean;
}

const GridCard: React.FC<GridCardProps> = ({
  item,
  theme,
  index,
  onPress,
  onLike,
  isLiked,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);
  const glow = getGlowColor(theme);
  const overlayColors = getOverlayGradient(theme);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1.5,
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
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
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
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
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
          {/* Top badges */}
          <View style={styles.topRow}>
            {item.isAR && (
              <View style={[styles.arPill, { backgroundColor: accent + "dd" }]}>
                <Ionicons name="cube-outline" size={9} color="#fff" />
              </View>
            )}
          </View>

          {/* Bottom */}
          <LinearGradient
            colors={overlayColors as any}
            style={styles.bottomOverlay}
          >
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.bottomRow}>
              <Text style={styles.eraLabel}>{item.era}</Text>
              <TouchableOpacity onPress={handleLike}>
                <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={14}
                    color={isLiked ? "#ff4d6d" : "rgba(255,255,255,0.8)"}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: GRID_CARD_WIDTH,
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    height: GRID_CARD_WIDTH * 1.35,
    justifyContent: "space-between",
  },
  imageStyle: {
    borderRadius: 20,
  },
  topRow: {
    padding: 10,
    flexDirection: "row",
  },
  arPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomOverlay: {
    padding: 12,
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#ffffff",
    marginBottom: 6,
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eraLabel: {
    fontSize: 9,
    fontFamily: "SpaceMono-Regular",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
  },
});

export default GridCard;
