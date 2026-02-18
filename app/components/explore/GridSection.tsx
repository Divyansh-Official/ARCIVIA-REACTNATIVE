import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAccentColor, getGlowColor } from "../../../theme/gradients";
import { ThemeName, themes } from "@/theme/theme";
import { HeritageItem } from "./FeaturedCard";
import GridCard from "./GridCard";

interface GridSectionProps {
  items: HeritageItem[];
  theme: ThemeName;
  title: string;
  onPress: (item: HeritageItem) => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
  onSeeAll?: () => void;
}

const GridSection: React.FC<GridSectionProps> = ({
  items,
  theme,
  title,
  onPress,
  onLike,
  likedIds,
  onSeeAll,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.line, { backgroundColor: accent }]} />
          <Text style={[styles.title, { color: t.text01 }]}>{title}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: accent }]}>See All →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        {items.map((item, idx) => (
          <GridCard
            key={item.id}
            item={item}
            theme={theme}
            index={idx}
            onPress={onPress}
            onLike={onLike}
            isLiked={likedIds.has(item.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
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
    gap: 10,
  },
  line: {
    width: 3,
    height: 18,
    borderRadius: 2,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
});

export default GridSection;
