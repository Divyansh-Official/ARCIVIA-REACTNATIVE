"use client";
import { useTheme } from "@/app/context/ThemeContext";
import { THEME_REGISTRY } from "@/theme/themeRegistery";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Layout ───────────────────────────────────────────────────────────
const N = THEME_REGISTRY.length;
const PILL_WIDTH = Math.max(260, N * 76);
const PILL_HEIGHT = 58;
const THUMB_SIZE = 44;
const THUMB_PAD = 7;
const THUMB_TRAVEL = PILL_WIDTH - THUMB_PAD * 2 - THUMB_SIZE;
const STEP = N > 1 ? THUMB_TRAVEL / (N - 1) : 0;
const ICON_SIZE = 24;

// Position helpers — thumb and icons both use these
const thumbLeft = (i: number) => THUMB_PAD + i * STEP;
const iconLeft = (i: number) => thumbLeft(i) + (THUMB_SIZE - ICON_SIZE) / 2;

// ─── Component ────────────────────────────────────────────────────────
export default function ThemeToggle() {
  const { themeName, theme, setTheme } = useTheme();
  const activeIdx = THEME_REGISTRY.findIndex((t) => t.name === themeName);
  const safeIdx = activeIdx >= 0 ? activeIdx : 0;

  const thumbX = useRef(new Animated.Value(safeIdx * STEP)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const labelOps = useRef(
    THEME_REGISTRY.map((_, i) => new Animated.Value(i === safeIdx ? 1 : 0)),
  ).current;

  // Sync on theme change
  useEffect(() => {
    const idx = THEME_REGISTRY.findIndex((t) => t.name === themeName);
    if (idx < 0) return;

    Animated.spring(thumbX, {
      toValue: idx * STEP,
      damping: 14,
      stiffness: 140,
      useNativeDriver: true,
    }).start();

    labelOps.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === idx ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  }, [themeName]);

  // Glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.4,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Tap
  const handleSelect = useCallback(
    (name: string) => {
      if (name === themeName) return;
      Animated.sequence([
        Animated.spring(thumbScale, {
          toValue: 0.8,
          useNativeDriver: true,
          damping: 6,
          stiffness: 220,
        }),
        Animated.spring(thumbScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 10,
          stiffness: 180,
        }),
      ]).start();
      setTheme(name as any);
    },
    [themeName, setTheme],
  );

  const active = THEME_REGISTRY[safeIdx];
  const isLight = themeName === "dark";

  return (
    <View style={styles.wrapper}>
      {/* Cross-fade label */}
      <View style={styles.labelRow}>
        {THEME_REGISTRY.map((t, i) => (
          <Animated.Text
            key={t.name}
            style={[
              styles.floatingLabel,
              { opacity: labelOps[i], color: theme.text01 },
            ]}
          >
            {t.label} Mode
          </Animated.Text>
        ))}
      </View>

      {/* Pill */}
      <View
        style={[styles.pillOuter, { width: PILL_WIDTH, height: PILL_HEIGHT }]}
      >
        {/* Glow */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              width: PILL_WIDTH + 14,
              height: PILL_HEIGHT + 14,
              borderRadius: (PILL_HEIGHT + 14) / 2,
              backgroundColor: active.glow,
              transform: [{ scale: glowPulse }],
            },
          ]}
        />

        <BlurView
          intensity={isLight ? 70 : 40}
          tint={isLight ? "light" : "dark"}
          style={[
            styles.pillBlur,
            {
              width: PILL_WIDTH,
              height: PILL_HEIGHT,
              borderRadius: PILL_HEIGHT / 2,
            },
          ]}
        >
          <LinearGradient
            colors={
              isLight
                ? ["rgba(255,255,255,0.75)", "rgba(255,255,255,0.55)"]
                : ["rgba(15,20,40,0.85)", "rgba(10,14,30,0.75)"]
            }
            style={[styles.pillGradient, { borderRadius: PILL_HEIGHT / 2 }]}
          >
            {/* LAYER 0 — background icons */}
            {THEME_REGISTRY.map((t, i) => (
              <Image
                key={"icon-" + t.name}
                source={t.icon}
                style={[
                  styles.slotIcon,
                  {
                    left: iconLeft(i),
                    top: (PILL_HEIGHT - ICON_SIZE) / 2,
                    opacity: themeName === t.name ? 0 : 0.3,
                  },
                ]}
                resizeMode="contain"
                tintColor={
                  isLight ? "rgba(107,83,68,0.7)" : "rgba(255,255,255,0.5)"
                }
              />
            ))}

            {/* LAYER 1 — animated thumb */}
            <Animated.View
              style={[
                styles.thumb,
                {
                  left: THUMB_PAD,
                  top: THUMB_PAD,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  transform: [{ translateX: thumbX }, { scale: thumbScale }],
                },
              ]}
            >
              <BlurView
                intensity={isLight ? 80 : 50}
                tint={isLight ? "light" : "dark"}
                style={[styles.thumbBlur, { borderRadius: THUMB_SIZE / 2 }]}
              >
                <LinearGradient
                  colors={active.gradients}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.thumbGradient,
                    { borderRadius: THUMB_SIZE / 2 },
                  ]}
                >
                  <Image
                    source={active.icon}
                    style={styles.thumbIcon}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </BlurView>
            </Animated.View>

            {/* LAYER 2 — invisible tap strips (above thumb so taps always work) */}
            {THEME_REGISTRY.map((t, i) => (
              <TouchableOpacity
                key={"tap-" + t.name}
                onPress={() => handleSelect(t.name)}
                activeOpacity={0.4}
                style={[
                  styles.tapStrip,
                  { left: thumbLeft(i), width: THUMB_SIZE },
                ]}
              />
            ))}
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  labelRow: {
    height: 22,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingLabel: {
    position: "absolute",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  pillOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowLayer: {
    position: "absolute",
    opacity: 0,
  },
  pillBlur: {
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  pillGradient: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.18)",
    position: "relative",
  },
  slotIcon: {
    position: "absolute",
    width: ICON_SIZE,
    height: ICON_SIZE,
    zIndex: 0,
  },
  thumb: {
    position: "absolute",
    zIndex: 1,
  },
  thumbBlur: {
    flex: 1,
    overflow: "hidden",
  },
  thumbGradient: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  thumbIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  tapStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
});
