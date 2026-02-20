import GlassView from "@/app/components/UI/GlassView";
import { useTheme } from "@/app/context/ThemeContext";
import { getAccentColor, getGlowColor } from "@/theme/gradients";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (t: string) => void;
  onFilterPress: () => void;
  scrollY: Animated.Value;
}

const COLLAPSE_DIST = 70;

const ExploreHeader: React.FC<ExploreHeaderProps> = memo(
  ({ searchQuery, onSearchChange, onFilterPress, scrollY }) => {
    const { theme, themeName } = useTheme();
    const accent = getAccentColor(themeName);
    const glow = getGlowColor(themeName);
    const inputRef = useRef<TextInput>(null);

    // All interpolations use nativeDriver: true — no JS thread blocking
    const titleScale = scrollY.interpolate({
      inputRange: [0, COLLAPSE_DIST],
      outputRange: [1, 0.86],
      extrapolate: "clamp",
    });

    const titleOpacity = scrollY.interpolate({
      inputRange: [0, COLLAPSE_DIST * 0.6],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const headerTranslate = scrollY.interpolate({
      inputRange: [0, COLLAPSE_DIST],
      outputRange: [0, -6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Animated.Text
              style={[
                styles.subtitle,
                { color: accent, opacity: titleOpacity },
              ]}
            >
              ◈ HERITAGE AUGMENTED
            </Animated.Text>
            <Animated.Text
              style={[
                styles.title,
                { color: theme.text01, transform: [{ scale: titleScale }] },
              ]}
            >
              EXPLORE
            </Animated.Text>
          </View>

          {/* Filter button — glass */}
          <TouchableOpacity
            onPress={onFilterPress}
            activeOpacity={0.75}
            style={[styles.filterBtn, { shadowColor: glow }]}
          >
            <GlassView
              intensity={55}
              accentTint
              style={[styles.filterGlass, { borderColor: accent + "45" }]}
            >
              <Ionicons name="options-outline" size={20} color={accent} />
            </GlassView>
          </TouchableOpacity>
        </View>

        {/* Search bar — glass */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => inputRef.current?.focus()}
        >
          <GlassView
            intensity={50}
            style={[styles.searchBar, { borderColor: accent + "30" }]}
          >
            <Image
              source={require("../../../assets/icons/search_icon01.png")}
              className="w-6 h-6"
              style={[styles.searchIcon, { tintColor: theme.text02 + "90" }]}
            />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: theme.text01 }]}
              placeholder="Search artifacts, eras, cultures..."
              placeholderTextColor={theme.text02 + "90"}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Image
                  source={require("../../../assets/icons/cross_icon01.png")}
                  className="w-5 h-5"
                  style={{ tintColor: theme.text02 + "90" }}
                />
              </TouchableOpacity>
            )}
          </GlassView>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 58 : 42,
    paddingBottom: 14,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  titleBlock: { gap: 2 },
  subtitle: {
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 36,
    fontFamily: "PlayfairDisplay-Bold",
    letterSpacing: 6,
  },
  filterBtn: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 15,
  },
  filterGlass: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  searchIcon: { marginRight: 10},
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.3,
    paddingVertical: 0,
  },
});

ExploreHeader.displayName = "ExploreHeader";
export default ExploreHeader;
