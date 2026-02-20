import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAccentColor } from "@/theme/gradients";
import { useTheme } from "@/app/context/ThemeContext";

export const CATEGORIES = [
  { id: "all",       label: "All",       icon: "◈" },
  { id: "trending",  label: "Trending",  icon: "⟡" },
  { id: "ancient",   label: "Ancient",   icon: "⊕" },
  { id: "medieval",  label: "Medieval",  icon: "⊗" },
  { id: "artifacts", label: "Artifacts", icon: "◉" },
  { id: "monuments", label: "Monuments", icon: "⊞" },
  { id: "museums",   label: "Museums",   icon: "⊟" },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

// Each tab is memoized — only re-renders when its own active state changes
const Tab = memo(({
  cat,
  isActive,
  accent,
  textColor,
  onPress,
}: {
  cat: typeof CATEGORIES[number];
  isActive: boolean;
  accent: string;
  textColor: string;
  themeName: string;
  onPress: (id: string) => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 65, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress(cat.id);
  }, [cat.id, onPress]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {isActive ? (
          <LinearGradient
            colors={[accent, accent + "cc"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tab, styles.activeTab, { shadowColor: accent }]}
          >
            <Text style={styles.tabIcon}>{cat.icon}</Text>
            <Text style={styles.activeLabel}>{cat.label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.tab, styles.inactiveTab, { borderColor: accent + "30" }]}>
            <Text style={[styles.tabIcon, { color: textColor }]}>{cat.icon}</Text>
            <Text style={[styles.inactiveLabel, { color: textColor }]}>{cat.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const CategoryTabs: React.FC<CategoryTabsProps> = memo(({ activeCategory, onCategoryChange }) => {
  const { theme, themeName } = useTheme();
  const accent = getAccentColor(themeName);

  const handleChange = useCallback((id: string) => {
    onCategoryChange(id);
  }, [onCategoryChange]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
      decelerationRate="fast"
    >
      {CATEGORIES.map(cat => (
        <Tab
          key={cat.id}
          cat={cat}
          isActive={activeCategory === cat.id}
          accent={accent}
          textColor={theme.text02}
          themeName={themeName}
          onPress={handleChange}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container:     { marginTop: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 6, gap: 8, flexDirection: "row" },
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
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  inactiveTab: {
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabIcon:       { fontSize: 11 },
  activeLabel:   { fontSize: 12, fontFamily: "SpaceMono-Regular", color: "#fff", letterSpacing: 0.5 },
  inactiveLabel: { fontSize: 12, fontFamily: "SpaceMono-Regular", letterSpacing: 0.5 },
});

CategoryTabs.displayName = "CategoryTabs";
Tab.displayName = "Tab";
export default CategoryTabs;