import { useTheme } from "@/app/context/ThemeContext";
import { getAccentColor } from "@/theme/gradients";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeritageItem } from "../explore/FeaturedCard";

const { height } = Dimensions.get("window");
const HERO_HEIGHT = height * 0.55;

interface DetailHeroProps {
  item: HeritageItem;
  scrollY: Animated.Value;
  onBack: () => void;
  onLike: () => void;
  onShare: () => void;
  isLiked: boolean;
}

const DetailHero: React.FC<DetailHeroProps> = ({
  item,
  scrollY,
  onBack,
  onLike,
  onShare,
  isLiked,
}) => {
  const { themeName } = useTheme();
  const accent = getAccentColor(themeName);
  const insets = useSafeAreaInsets();
  const likeAnim = useRef(new Animated.Value(1)).current;

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.3],
    extrapolate: "clamp",
  });

  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.5],
    outputRange: [1, 0.4],
    extrapolate: "clamp",
  });

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
    onLike();
  };

  const NavButton = ({
    onPress,
    children,
  }: {
    onPress: () => void;
    children: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full overflow-hidden"
    >
      <BlurView
        intensity={60}
        tint={themeName === "light" ? "light" : "dark"}
        className="p-2.5 rounded-full overflow-hidden"
      >
        {children}
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={{ height: HERO_HEIGHT, overflow: "hidden" }}>
      <Animated.View
        style={{
          height: HERO_HEIGHT * 1.3,
          top: -HERO_HEIGHT * 0.15,
          transform: [{ translateY: imageTranslateY }],
        }}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={{ flex: 1, justifyContent: "space-between" }}
          resizeMode="cover"
        >
          <Animated.View
            style={{
              opacity: overlayOpacity,
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View
              className="flex-row justify-between items-center px-4"
              style={{ paddingTop: insets.top + 10 }}
            >
              <NavButton onPress={onBack}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </NavButton>
              <View className="flex-row gap-2.5">
                <NavButton onPress={onShare}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </NavButton>
                <NavButton onPress={handleLike}>
                  <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#ff4d6d" : "#fff"}
                    />
                  </Animated.View>
                </NavButton>
              </View>
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.9)"]}
              className="p-5 pt-12"
            >
              <View className="flex-row gap-2 mb-2.5">
                <View
                  className="border rounded-md px-2.5 py-1"
                  style={{
                    borderColor: accent + "70",
                    backgroundColor: accent + "25",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceMono-Regular",
                      fontSize: 9,
                      color: accent,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.era}
                  </Text>
                </View>
                {item.isAR && (
                  <View
                    className="flex-row items-center gap-1.5 border rounded-md px-2.5 py-1"
                    style={{
                      borderColor: "#00ffcc40",
                      backgroundColor: "#00ffcc18",
                    }}
                  >
                    <Ionicons name="cube-outline" size={11} color="#00ffcc" />
                    <Text
                      style={{
                        fontFamily: "SpaceMono-Regular",
                        fontSize: 9,
                        color: "#00ffcc",
                        letterSpacing: 1,
                      }}
                    >
                      AR Available
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontFamily: "PlayfairDisplay-Bold",
                  fontSize: 30,
                  color: "#fff",
                  letterSpacing: -0.5,
                  marginBottom: 6,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontFamily: "SpaceMono-Regular",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: 14,
                }}
              >
                {item.culture} · {item.location}
              </Text>

              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="eye-outline"
                    size={14}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text
                    style={{
                      fontFamily: "SpaceMono-Regular",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {((item?.views ?? 0) / 1000).toFixed(1)}k views{" "}
                  </Text>
                </View>
                <View className="w-px h-3 bg-white/20" />
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name="heart-outline"
                    size={14}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text
                    style={{
                      fontFamily: "SpaceMono-Regular",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {(item?.likes ?? 0).toLocaleString()} likes
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export default DetailHero;
