import { ThemeName, themes } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    getAccentColor,
    getCardGradient
} from "../../../theme/gradients";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.65;

export interface FilterState {
  era: string[];
  culture: string[];
  arOnly: boolean;
  sortBy: "popular" | "newest" | "oldest";
}

const ERAS = ["Prehistoric", "Ancient", "Medieval", "Renaissance", "Modern"];
const CULTURES = [
  "Egyptian",
  "Greek",
  "Roman",
  "Asian",
  "Mesopotamian",
  "Celtic",
];
const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
];

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeName;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onApply: () => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  theme,
  filters,
  onFiltersChange,
  onApply,
}) => {
  const t = themes[theme];
  const accent = getAccentColor(theme);
  const cardGrad = getCardGradient(theme);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 10,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleEra = (era: string) => {
    const next = filters.era.includes(era)
      ? filters.era.filter((e) => e !== era)
      : [...filters.era, era];
    onFiltersChange({ ...filters, era: next });
  };

  const toggleCulture = (culture: string) => {
    const next = filters.culture.includes(culture)
      ? filters.culture.filter((c) => c !== culture)
      : [...filters.culture, culture];
    onFiltersChange({ ...filters, culture: next });
  };

  const ChipRow = ({
    items,
    selected,
    onToggle,
  }: {
    items: string[];
    selected: string[];
    onToggle: (v: string) => void;
  }) => (
    <View style={styles.chipRow}>
      {items.map((item) => {
        const isSelected = selected.includes(item);
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onToggle(item)}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: accent, borderColor: accent }
                : {
                    borderColor: accent + "40",
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                  },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? "#fff" : t.text02 },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <LinearGradient colors={cardGrad as any} style={styles.sheetContent}>
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: accent + "50" }]} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: t.text01 }]}>Filter</Text>
            <TouchableOpacity
              onPress={() =>
                onFiltersChange({
                  era: [],
                  culture: [],
                  arOnly: false,
                  sortBy: "popular",
                })
              }
            >
              <Text style={[styles.clearText, { color: accent }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: t.text02 }]}>ERA</Text>
            <ChipRow items={ERAS} selected={filters.era} onToggle={toggleEra} />

            <Text style={[styles.sectionLabel, { color: t.text02 }]}>
              CULTURE
            </Text>
            <ChipRow
              items={CULTURES}
              selected={filters.culture}
              onToggle={toggleCulture}
            />

            <Text style={[styles.sectionLabel, { color: t.text02 }]}>
              SORT BY
            </Text>
            <View style={styles.sortRow}>
              {SORT_OPTIONS.map((opt) => {
                const isActive = filters.sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() =>
                      onFiltersChange({ ...filters, sortBy: opt.id as any })
                    }
                    style={[
                      styles.sortBtn,
                      isActive
                        ? {
                            backgroundColor: accent + "20",
                            borderColor: accent,
                          }
                        : {
                            borderColor: accent + "30",
                            backgroundColor: "transparent",
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortText,
                        { color: isActive ? accent : t.text02 },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* AR Toggle */}
            <TouchableOpacity
              style={[
                styles.arToggle,
                {
                  borderColor: filters.arOnly ? accent : accent + "30",
                  backgroundColor: filters.arOnly
                    ? accent + "18"
                    : "transparent",
                },
              ]}
              onPress={() =>
                onFiltersChange({ ...filters, arOnly: !filters.arOnly })
              }
            >
              <View style={styles.arToggleLeft}>
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={filters.arOnly ? accent : t.text02}
                />
                <View>
                  <Text
                    style={[
                      styles.arToggleTitle,
                      { color: filters.arOnly ? accent : t.text01 },
                    ]}
                  >
                    AR Experience Only
                  </Text>
                  <Text style={[styles.arToggleSub, { color: t.text02 }]}>
                    Show items with AR view
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: filters.arOnly
                      ? accent
                      : t.secondary02 + "60",
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleCircle,
                    {
                      marginLeft: filters.arOnly ? 20 : 2,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Apply */}
          <TouchableOpacity onPress={onApply} style={styles.applyWrapper}>
            <LinearGradient
              colors={[accent, accent + "cc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  sheetContent: {
    flex: 1,
    paddingBottom: 34,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay-Bold",
  },
  clearText: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 2,
    paddingHorizontal: 24,
    marginBottom: 10,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.3,
  },
  sortRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 2,
  },
  sortText: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
  },
  arToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  arToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  arToggleTitle: {
    fontSize: 13,
    fontFamily: "PlayfairDisplay-Bold",
  },
  arToggleSub: {
    fontSize: 10,
    fontFamily: "SpaceMono-Regular",
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  applyWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
  },
  applyText: {
    fontSize: 14,
    fontFamily: "SpaceMono-Regular",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});

export default FilterBottomSheet;
