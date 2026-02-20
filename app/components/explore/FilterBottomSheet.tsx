import GlassView from "@/app/components/UI/GlassView";
import { useTheme } from "@/app/context/ThemeContext";
import { getAccentColor } from "@/theme/gradients";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useRef } from "react";
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

const { height } = Dimensions.get("window");
const SHEET_H = height * 0.65;

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

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onApply: () => void;
}
interface ChipProps {
  label: string;
  selected: boolean;
  accent: string;
  textColor: string;
  onToggle: (v: string) => void;
}

const Chip = memo(function Chip({
  label,
  selected,
  accent,
  textColor,
  onToggle,
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(label)}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accent : "rgba(255,255,255,0.06)",
          borderColor: selected ? accent : accent + "35",
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? "#fff" : textColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const FilterBottomSheet: React.FC<Props> = memo(
  ({ visible, onClose, filters, onFiltersChange, onApply }) => {
    const { theme, themeName } = useTheme();
    const accent = getAccentColor(themeName);

    const translateY = useRef(new Animated.Value(SHEET_H)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            friction: 11,
            tension: 65,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SHEET_H,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible]);

    const toggleEra = useCallback(
      (era: string) =>
        onFiltersChange({
          ...filters,
          era: filters.era.includes(era)
            ? filters.era.filter((e) => e !== era)
            : [...filters.era, era],
        }),
      [filters, onFiltersChange],
    );

    const toggleCulture = useCallback(
      (culture: string) =>
        onFiltersChange({
          ...filters,
          culture: filters.culture.includes(culture)
            ? filters.culture.filter((c) => c !== culture)
            : [...filters.culture, culture],
        }),
      [filters, onFiltersChange],
    );

    const clearAll = useCallback(
      () =>
        onFiltersChange({
          era: [],
          culture: [],
          arOnly: false,
          sortBy: "popular",
        }),
      [onFiltersChange],
    );

    if (!visible) return null;

    return (
      <Modal
        transparent
        visible={visible}
        onRequestClose={onClose}
        animationType="none"
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <GlassView
            intensity={85}
            accentTint={false}
            style={styles.sheetInner}
          >
            {/* Handle bar */}
            <View style={styles.handleWrap}>
              <View
                style={[styles.handle, { backgroundColor: accent + "55" }]}
              />
            </View>

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text01 }]}>
                Filter
              </Text>
              <TouchableOpacity
                onPress={clearAll}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.clearText, { color: accent }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* ERA */}
              <Text style={[styles.sectionLabel, { color: theme.text02 }]}>
                ERA
              </Text>
              <View style={styles.chipRow}>
                {ERAS.map((era) => (
                  <Chip
                    key={era}
                    label={era}
                    selected={filters.era.includes(era)}
                    accent={accent}
                    textColor={theme.text02}
                    onToggle={toggleEra}
                  />
                ))}
              </View>

              {/* CULTURE */}
              <Text style={[styles.sectionLabel, { color: theme.text02 }]}>
                CULTURE
              </Text>
              <View style={styles.chipRow}>
                {CULTURES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={filters.culture.includes(c)}
                    accent={accent}
                    textColor={theme.text02}
                    onToggle={toggleCulture}
                  />
                ))}
              </View>

              {/* SORT */}
              <Text style={[styles.sectionLabel, { color: theme.text02 }]}>
                SORT BY
              </Text>
              <View style={styles.sortCol}>
                {SORT_OPTIONS.map((opt) => {
                  const active = filters.sortBy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() =>
                        onFiltersChange({ ...filters, sortBy: opt.id as any })
                      }
                      style={[
                        styles.sortBtn,
                        {
                          backgroundColor: active
                            ? accent + "20"
                            : "transparent",
                          borderColor: active ? accent : accent + "28",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sortText,
                          { color: active ? accent : theme.text02 },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* AR TOGGLE */}
              <TouchableOpacity
                style={[
                  styles.arToggle,
                  {
                    borderColor: filters.arOnly ? accent : accent + "28",
                    backgroundColor: filters.arOnly
                      ? accent + "16"
                      : "transparent",
                  },
                ]}
                onPress={() =>
                  onFiltersChange({ ...filters, arOnly: !filters.arOnly })
                }
              >
                <View style={styles.arLeft}>
                  <Ionicons
                    name="cube-outline"
                    size={18}
                    color={filters.arOnly ? accent : theme.text02}
                  />
                  <View>
                    <Text
                      style={[
                        styles.arTitle,
                        { color: filters.arOnly ? accent : theme.text01 },
                      ]}
                    >
                      AR Experience Only
                    </Text>
                    <Text style={[styles.arSub, { color: theme.text02 }]}>
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
                        : theme.secondary02 + "60",
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleCircle,
                      { marginLeft: filters.arOnly ? 20 : 2 },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Apply */}
            <TouchableOpacity
              onPress={onApply}
              style={styles.applyWrap}
              activeOpacity={0.85}
            >
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
          </GlassView>
        </Animated.View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  sheetInner: {
    flex: 1,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sheetTitle: { fontSize: 20, fontFamily: "PlayfairDisplay-Bold" },
  clearText: {
    fontSize: 12,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
  },
  scrollContent: { paddingBottom: 8 },
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
  sortCol: { paddingHorizontal: 20, gap: 8 },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortText: { fontSize: 12, fontFamily: "SpaceMono-Regular" },
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
  arLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  arTitle: { fontSize: 13, fontFamily: "PlayfairDisplay-Bold" },
  arSub: { fontSize: 10, fontFamily: "SpaceMono-Regular", marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center" },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  applyWrap: {
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
    color: "#fff",
    letterSpacing: 0.5,
  },
});

FilterBottomSheet.displayName = "FilterBottomSheet";
export default FilterBottomSheet;
