import { useTheme } from "@/app/context/ThemeContext";
import { getAccentColor } from "@/theme/gradients";
import { BlurView } from "expo-blur";
import React, { memo } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accentTint?: boolean;
  borderOpacity?: number;
}

/**
 * Cross-platform glass morphism component.
 * iOS  → BlurView (native compositor, zero JS cost)
 * Android → semi-transparent bg + border (BlurView tanks perf on Android)
 */
const GlassView: React.FC<GlassViewProps> = memo(
  ({
    children,
    intensity = 60,
    style,
    className,
    accentTint = false,
    borderOpacity = 0.18,
  }) => {
    const { theme, themeName } = useTheme();
    const accent = getAccentColor(themeName);
    const isDark = themeName === "dark";

    if (Platform.OS === "ios") {
      return (
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={[styles.base, style]}
        >
          {accentTint && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: accent + "14",
                  borderRadius: (style as any)?.borderRadius ?? 0,
                },
              ]}
            />
          )}
          {children}
        </BlurView>
      );
    }

    // Android fallback — no BlurView to avoid jank
    return (
      <View
        style={[
          styles.base,
          {
            backgroundColor: isDark
              ? accentTint
                ? accent + "22"
                : "rgba(18,18,30,0.82)"
              : accentTint
                ? accent + "14"
                : "rgba(248,248,255,0.88)",
            borderWidth: 1,
            borderColor: accentTint
              ? accent + "40"
              : isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(0,0,0,0.08)",
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});

GlassView.displayName = "GlassView";
export default GlassView;
