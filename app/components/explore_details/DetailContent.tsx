import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { HeritageItem } from "../explore/FeaturedCard";
import { getAccentColor } from "@/theme/gradients";
import { useTheme } from "@/app/context/ThemeContext";

interface DetailContentProps {
  item: HeritageItem;
  onARPress: () => void;
}

const InfoChip = ({ icon, label, value }: { icon: string; label: string; value: string }) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);
  return (
    <View
      className="flex-row items-center gap-2.5 p-3 rounded-2xl border flex-1 min-w-[45%]"
      style={{
        backgroundColor: themeName === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        borderColor: accent + "25",
      }}
    >
      <Ionicons name={icon as any} size={14} color={accent} />
      <View>
        <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 8, letterSpacing: 1.5, marginBottom: 2, color: theme.text02 }}>
          {label}
        </Text>
        <Text style={{ fontFamily: "PlayfairDisplay-Bold", fontSize: 11, color: theme.text01 }}>{value}</Text>
      </View>
    </View>
  );
};

const SectionHeader = ({ label }: { label: string }) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);
  return (
    <View className="flex-row items-center gap-2.5 mb-3">
      <View className="w-0.5 h-4 rounded-sm" style={{ backgroundColor: accent }} />
      <Text style={{ fontFamily: "PlayfairDisplay-Bold", fontSize: 15, color: theme.text01 }}>{label}</Text>
    </View>
  );
};

const DetailContent: React.FC<DetailContentProps> = ({ item, onARPress }) => {
  const { themeName } = useTheme();
  const accent = getAccentColor(themeName);
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      className="pt-6 px-5"
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {item.isAR && (
        <TouchableOpacity
          onPress={onARPress}
          className="mb-6 rounded-[18px] overflow-hidden"
          style={{ shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }}
        >
          <LinearGradient
            colors={["#00ffcc44", "#7469dd44"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-3.5 p-4 rounded-[18px] border"
            style={{ borderColor: "#00ffcc50", shadowColor: "#00ffcc" }}
          >
            <Ionicons name="cube" size={22} color="#00ffcc" />
            <View className="flex-1">
              <Text style={{ fontFamily: "PlayfairDisplay-Bold", fontSize: 15, color: "#00ffcc" }}>
                View in AR
              </Text>
              <Text className="mt-0.5" style={{ fontFamily: "SpaceMono-Regular", fontSize: 10, color: "#00ffcc80" }}>
                Point camera at flat surface
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#00ffcc60" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View className="flex-row flex-wrap gap-2.5 mb-6">
        <InfoChip icon="location-outline" label="LOCATION" value={item.location} />
        <InfoChip icon="time-outline" label="PERIOD" value={item.era} />
        <InfoChip icon="globe-outline" label="CULTURE" value={item.culture} />
        <InfoChip icon="bookmark-outline" label="CATEGORY" value={item.category} />
      </View>

      <View className="mb-6">
        <SectionHeader label="About" />
        <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 14, lineHeight: 22, letterSpacing: 0.2, color: theme.text02 }}>
          {item.description}
        </Text>
      </View>

      <View className="mb-6">
        <SectionHeader label="Tags" />
        <View className="flex-row flex-wrap gap-2">
          {(item?.tags ?? []).map((tag) => (
            <View
              key={tag}
              className="px-3 py-1.5 rounded-full border"
              style={{ backgroundColor: accent + "18", borderColor: accent + "40" }}
            >
              <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 11, letterSpacing: 0.3, color: accent }}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default DetailContent;