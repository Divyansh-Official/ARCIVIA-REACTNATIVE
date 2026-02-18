import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width < 380 ? 22 : width < 430 ? 26 : 30;
const ICON_CONTAINER_WIDTH = width < 380 ? 60 : width < 430 ? 65 : 70;

const TabIcon = ({
  focused,
  iconUnselected,
  iconSelected,
  lottie,
  isHomeTab = false,
  tintColor,
}: {
  focused: boolean;
  iconUnselected: any;
  iconSelected?: any;
  lottie?: any;
  isHomeTab?: boolean;
  tintColor: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.3 : 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 120,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {lottie ? (
          <LottieView source={lottie} autoPlay loop style={styles.lottie} />
        ) : focused && iconSelected ? (
          <Image
            source={iconSelected}
            style={[
              isHomeTab ? styles.homeIcon : styles.icon,
              !isHomeTab && { tintColor },
            ]}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={iconUnselected}
            style={[
              isHomeTab ? styles.homeIcon : styles.icon,
              !isHomeTab && { tintColor },
            ]}
            resizeMode="contain"
          />
        )}
      </Animated.View>
    </View>
  );
};

const LiquidGlassTabBar = ({ state, descriptors, navigation }: any) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = (width - 40) / state.routes.length;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View
          style={[
            styles.glassBackground,
            {
              backgroundColor: theme.primary01 + "4D", // ~30% opacity
              borderColor: theme.primary01 + "75", // ~40% opacity
            },
          ]}
        >
          {/* Liquid Sliding Indicator */}
          <Animated.View
            style={[
              styles.liquidIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.liquidBlob,
                {
                  backgroundColor: theme.primary01 + "80", // ~50% opacity
                  ...Platform.select({
                    ios: { shadowColor: theme.primary01 },
                    android: {},
                  }),
                },
              ]}
            />
          </Animated.View>

          {/* Tab Buttons */}
          <View style={styles.tabsRow}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  {options.tabBarIcon &&
                    options.tabBarIcon({
                      focused: isFocused,
                      tintColor: theme.icons01,
                    })}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "EXPLORE",
          tabBarIcon: ({ focused, tintColor }) => (
            <TabIcon
              focused={focused}
              tintColor={tintColor}
              iconUnselected={require("../../assets/bottom_navigation_icons/explore_unselected_icon01.png")}
              iconSelected={require("../../assets/bottom_navigation_icons/explore_selected_icon01.png")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "SCAN",
          tabBarIcon: ({ focused, tintColor }) => (
            <TabIcon
              focused={focused}
              tintColor={tintColor}
              iconUnselected={require("../../assets/bottom_navigation_icons/camera_unselected_icon01.png")}
              iconSelected={require("../../assets/bottom_navigation_icons/camera_selected_icon01.png")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: "CHATS",
          tabBarIcon: ({ focused, tintColor }) => (
            <TabIcon
              focused={focused}
              tintColor={tintColor}
              iconUnselected={require("../../assets/bottom_navigation_icons/chats_unselected_icon01.png")}
              iconSelected={require("../../assets/bottom_navigation_icons/chats_selected_icon01.png")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarIcon: ({ focused, tintColor }) => (
            <TabIcon
              focused={focused}
              tintColor={tintColor}
              iconUnselected={require("../../assets/bottom_navigation_icons/settings_unselected_icon01.png")}
              iconSelected={require("../../assets/bottom_navigation_icons/settings_selected_icon01.png")}
            />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 35,
    overflow: "hidden",
  },
  glassBackground: {
    flex: 1,
    borderRadius: 35,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  liquidIndicator: {
    position: "absolute",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  liquidBlob: {
    width: "80%",
    height: "85%",
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: ICON_CONTAINER_WIDTH,
    height: ICON_CONTAINER_WIDTH,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  icon: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  homeIcon: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  lottie: {
    width: IMAGE_SIZE + 10,
    height: IMAGE_SIZE + 10,
  },
});

export default _layout;