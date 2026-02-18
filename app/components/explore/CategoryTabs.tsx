import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAccentColor, getGlowColor } from "../../../theme/gradients";
import { ThemeName, themes } from "@/theme/theme";

export const CATEGORIES = [
  { id: "all", label: "All", icon: "◈" },
  { id: "trending", label: "Trending", icon: "⟡" },
  { id: "ancient", label: "Ancient", icon: "⊕" },
  { id: "medieval", label: "Medieval", icon: "⊗" },
  { id: "artifacts", label: "Artifacts", icon: "◉" },
  { id: "monuments", label: "Monuments", icon: "⊞" },
  { id: "museums", label: "Museums", icon: "⊟" },
];

interface CategoryTabsProps {
  theme: ThemeName;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  theme,
  activeCategory,
  onCategoryChange,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);
  const scaleAnims = useRef(
    CATEGORIES.reduce(
      (acc, cat) => {
        acc[cat.id] = new Animated.Value(1);
        return acc;
      },
      {} as Record<string, Animated.Value>,
    ),
  ).current;

  const handlePress = (id: string) => {
    Animated.sequence([
      Animated.timing(scaleAnims[id], {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[id], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onCategoryChange(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <Animated.View
            key={cat.id}
            style={{ transform: [{ scale: scaleAnims[cat.id] }] }}
          >
            <TouchableOpacity
              onPress={() => handlePress(cat.id)}
              activeOpacity={0.8}
              style={styles.tabWrapper}
            >
              {isActive ? (
                <LinearGradient
                  colors={[accent, accent + "cc"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tab, styles.activeTab]}
                >
                  <Text style={styles.activeIcon}>{cat.icon}</Text>
                  <Text style={[styles.tabLabel, styles.activeLabel]}>
                    {cat.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.tab,
                    styles.inactiveTab,
                    {
                      borderColor: accent + "30",
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                    },
                  ]}
                >
                  <Text style={[styles.inactiveIcon, { color: t.text02 }]}>
                    {cat.icon}
                  </Text>
                  <Text style={[styles.tabLabel, { color: t.text02 }]}>
                    {cat.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
    flexDirection: "row",
  },
  tabWrapper: {
    marginRight: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 40,
    gap: 5,
  },
  activeTab: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveTab: {
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: "#ffffff",
    fontFamily: "SpaceMono-Regular",
  },
  activeIcon: {
    fontSize: 11,
    color: "#ffffff",
  },
  inactiveIcon: {
    fontSize: 11,
  },
});

export default CategoryTabs;
