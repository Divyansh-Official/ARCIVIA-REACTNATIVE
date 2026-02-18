import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getAccentColor, getGlowColor } from "../../../theme/gradients";
import { ThemeName, themes } from "@/theme/theme";

interface ExploreHeaderProps {
  theme: ThemeName;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  scrollY: Animated.Value;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  theme,
  searchQuery,
  onSearchChange,
  onFilterPress,
  scrollY,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);
  const glow = getGlowColor(theme);
  const inputRef = useRef<TextInput>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.97],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -4],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.88],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: titleScale }] }}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.subtitle, { color: accent }]}>
              ◈ HERITAGE AUGMENTED
            </Text>
            <Text style={[styles.title, { color: t.text01 }]}>Explore</Text>
          </View>
          <TouchableOpacity
            onPress={onFilterPress}
            style={[
              styles.filterBtn,
              { borderColor: accent, shadowColor: glow },
            ]}
          >
            <LinearGradient
              colors={[accent + "22", accent + "11"]}
              style={styles.filterGrad}
            >
              <Ionicons name="options-outline" size={20} color={accent} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.searchWrapper,
          {
            backgroundColor:
              theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            borderColor: accent + "33",
            shadowColor: glow,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={16}
          color={t.text02}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: t.text01 }]}
          placeholder="Search artifacts, eras, cultures..."
          placeholderTextColor={t.text02}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={16} color={t.text02} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: -0.5,
  },
  filterBtn: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  filterGrad: {
    padding: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.3,
  },
});

export default ExploreHeader;
